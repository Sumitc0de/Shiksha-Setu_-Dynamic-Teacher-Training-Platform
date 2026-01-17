import logging
from typing import Optional, Dict, Any

from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client

from core.config import settings


logger = logging.getLogger(__name__)


class WhatsAppService:
    """Service for sending WhatsApp messages (text + media) via Twilio.

    This is used to deliver module PDFs directly to teacher phone numbers.
    """

    def __init__(self) -> None:
        self.account_sid = settings.twilio_account_sid
        self.auth_token = settings.twilio_auth_token

        raw_from = settings.twilio_whatsapp_number
        # Accept either "+1415..." or "whatsapp:+1415..." from env and normalize
        if raw_from and raw_from.startswith("whatsapp:"):
            raw_from = raw_from[len("whatsapp:") :]
        self.whatsapp_number = raw_from

        if not (self.account_sid and self.auth_token and self.whatsapp_number):
            logger.warning(
                "Twilio WhatsApp is not fully configured. "
                "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER to enable it."
            )
            self.client: Optional[Client] = None
        else:
            self.client = Client(self.account_sid, self.auth_token)

    def is_configured(self) -> bool:
        """Return True if Twilio WhatsApp credentials are available."""
        return self.client is not None

    def send_whatsapp_message(
        self,
        to_number: str,
        body: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send a WhatsApp message.

        Args:
            to_number: Destination phone number in E.164 or Indian format (e.g. "+9198XXXXXXX").
            body: Text body of the message.
            media_url: Optional public HTTPS URL for media (e.g. module PDF).

        Returns:
            Dict with keys: success (bool), message_sid (str|None), status (str|None), error (str|None).
        """
        if not self.is_configured():
            msg = "Twilio WhatsApp service is not configured. Check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER."
            logger.error(msg)
            return {
                "success": False,
                "message_sid": None,
                "status": None,
                "error": msg,
            }

        # Twilio expects whatsapp: prefix
        from_number = f"whatsapp:{self.whatsapp_number}"
        to = to_number
        if not to_number.startswith("whatsapp:"):
            to = f"whatsapp:{to_number}"

        kwargs: Dict[str, Any] = {"from_": from_number, "to": to, "body": body}
        if media_url:
            kwargs["media_url"] = [media_url]

        try:
            message = self.client.messages.create(**kwargs)  # type: ignore[arg-type]
            logger.info(
                "Sent WhatsApp message via Twilio",
                extra={"to": to_number, "sid": message.sid, "status": message.status},
            )
            return {
                "success": True,
                "message_sid": message.sid,
                "status": getattr(message, "status", None),
                "error": None,
            }
        except TwilioRestException as exc:  # pragma: no cover - external service
            logger.error(
                "Twilio WhatsApp send failed",
                extra={"to": to_number, "code": exc.code, "msg": str(exc)},
            )
            return {
                "success": False,
                "message_sid": getattr(exc, "sid", None),
                "status": None,
                "error": str(exc),
            }
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Unexpected error while sending WhatsApp message")
            return {
                "success": False,
                "message_sid": None,
                "status": None,
                "error": str(exc),
            }
