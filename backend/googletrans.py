"""
googletrans compatibility module
Powered by Google Translate Neural Machine Translation service.
Provides the standard `Translator` interface: `from googletrans import Translator`.
"""
import logging
import requests
from typing import Optional, Union, List

logger = logging.getLogger("googletrans")

LANGUAGES = {
    "af": "afrikaans",
    "sq": "albanian",
    "am": "amharic",
    "ar": "arabic",
    "hy": "armenian",
    "az": "azerbaijani",
    "eu": "basque",
    "be": "belarusian",
    "bn": "bengali",
    "bs": "bosnian",
    "bg": "bulgarian",
    "ca": "catalan",
    "ceb": "cebuano",
    "ny": "chichewa",
    "zh-cn": "chinese (simplified)",
    "zh-tw": "chinese (traditional)",
    "co": "corsican",
    "hr": "croatian",
    "cs": "czech",
    "da": "danish",
    "nl": "dutch",
    "en": "english",
    "eo": "esperanto",
    "et": "estonian",
    "tl": "filipino",
    "fi": "finnish",
    "fr": "french",
    "fy": "frisian",
    "gl": "galician",
    "ka": "georgian",
    "de": "german",
    "el": "greek",
    "gu": "gujarati",
    "ht": "haitian creole",
    "ha": "hausa",
    "haw": "hawaiian",
    "iw": "hebrew",
    "he": "hebrew",
    "hi": "hindi",
    "hmn": "hmong",
    "hu": "hungarian",
    "is": "icelandic",
    "ig": "igbo",
    "id": "indonesian",
    "ga": "irish",
    "it": "italian",
    "ja": "japanese",
    "jw": "javanese",
    "kn": "kannada",
    "kk": "kazakh",
    "km": "khmer",
    "ko": "korean",
    "ku": "kurdish (kurmanji)",
    "ky": "kyrgyz",
    "lo": "lao",
    "la": "latin",
    "lv": "latvian",
    "lt": "lithuanian",
    "lb": "luxembourgish",
    "mk": "macedonian",
    "mg": "malagasy",
    "ms": "malay",
    "ml": "malayalam",
    "mt": "maltese",
    "mi": "maori",
    "mr": "marathi",
    "mn": "mongolian",
    "my": "myanmar (burmese)",
    "ne": "nepali",
    "no": "norwegian",
    "or": "odia",
    "ps": "pashto",
    "fa": "persian",
    "pl": "polish",
    "pt": "portuguese",
    "pa": "punjabi",
    "ro": "romanian",
    "ru": "russian",
    "sm": "samoan",
    "gd": "scots gaelic",
    "sr": "serbian",
    "st": "sesotho",
    "sn": "shona",
    "sd": "sindhi",
    "si": "sinhala",
    "sk": "slovak",
    "sl": "slovenian",
    "so": "somali",
    "es": "spanish",
    "su": "sundanese",
    "sw": "swahili",
    "sv": "swedish",
    "tg": "tajik",
    "ta": "tamil",
    "te": "telugu",
    "th": "thai",
    "tr": "turkish",
    "uk": "ukrainian",
    "ur": "urdu",
    "ug": "uyghur",
    "uz": "uzbek",
    "vi": "vietnamese",
    "cy": "welsh",
    "xh": "xhosa",
    "yi": "yiddish",
    "yo": "yoruba",
    "zu": "zulu",
}

LANGCODES = dict(map(reversed, LANGUAGES.items()))


class Translated:
    def __init__(self, text: str, src: str, dest: str, origin: str):
        self.text = text
        self.src = src
        self.dest = dest
        self.origin = origin

    def __str__(self):
        return f"Translated(src={self.src}, dest={self.dest}, text={self.text[:30]}...)"

    def __repr__(self):
        return self.__str__()


class Translator:
    """Google Translate API client using Google's free neural translation service."""

    def __init__(self, service_urls: Optional[List[str]] = None, timeout: float = 12.0):
        self.timeout = timeout
        self.base_url = "https://translate.googleapis.com/translate_a/single"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
        }

    def translate(self, text: str, dest: str = "en", src: str = "auto") -> Translated:
        """Translate text to destination language."""
        if not text or not str(text).strip():
            return Translated(text=str(text), src=src, dest=dest, origin=str(text))

        raw_text = str(text)

        # Standardize language codes
        dest_code = dest.lower().strip()
        if dest_code in LANGCODES:
            dest_code = LANGCODES[dest_code]

        src_code = src.lower().strip()
        if src_code in LANGCODES:
            src_code = LANGCODES[src_code]

        try:
            params = {
                "client": "gtx",
                "sl": src_code,
                "tl": dest_code,
                "dt": "t",
                "q": raw_text,
            }
            res = requests.get(
                self.base_url,
                params=params,
                headers=self.headers,
                timeout=self.timeout,
            )
            if res.status_code == 200:
                data = res.json()
                translated_parts = [part[0] for part in data[0] if part and part[0]]
                translated_text = "".join(translated_parts)
                detected_src = data[2] if len(data) > 2 and isinstance(data[2], str) else src_code
                return Translated(
                    text=translated_text,
                    src=detected_src,
                    dest=dest_code,
                    origin=raw_text,
                )
            else:
                logger.warning(f"Google translate request failed with status: {res.status_code}")
        except Exception as e:
            logger.warning(f"Google translate exception: {e}")
            raise e

        return Translated(text=raw_text, src=src_code, dest=dest_code, origin=raw_text)
