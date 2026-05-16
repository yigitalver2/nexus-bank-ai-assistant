"""
Token fiyatlandırma sabitleri ve hesaplama yardımcıları.
Fiyatlar: USD / 1M token (Mayıs 2025 itibarıyla OpenAI listesi)
"""

PRICES = {
    # Chat tamamlama
    "gpt-4o": {
        "input":  2.50,   # $/1M token
        "output": 10.00,
    },
    # Realtime (ses + metin)
    "gpt-4o-realtime-preview": {
        "input_text":   5.00,
        "input_audio":  100.00,
        "output_text":  20.00,
        "output_audio": 200.00,
    },
    "gpt-realtime": {          # .env'deki model adı
        "input_text":   5.00,
        "input_audio":  100.00,
        "output_text":  20.00,
        "output_audio": 200.00,
    },
    # Embedding
    "text-embedding-3-small": {
        "input": 0.02,
    },
}


def calc_chat_cost(model: str, prompt_tokens: int, completion_tokens: int) -> float:
    p = PRICES.get(model, PRICES["gpt-4o"])
    return (prompt_tokens * p["input"] + completion_tokens * p["output"]) / 1_000_000


def calc_realtime_cost(
    model: str,
    input_text_tokens: int = 0,
    input_audio_tokens: int = 0,
    output_text_tokens: int = 0,
    output_audio_tokens: int = 0,
) -> float:
    p = PRICES.get(model, PRICES["gpt-realtime"])
    return (
        input_text_tokens  * p["input_text"]   +
        input_audio_tokens * p["input_audio"]  +
        output_text_tokens * p["output_text"]  +
        output_audio_tokens * p["output_audio"]
    ) / 1_000_000


def calc_embedding_cost(tokens: int) -> float:
    p = PRICES["text-embedding-3-small"]
    return tokens * p["input"] / 1_000_000


def log_session_cost(label: str, details: dict, total_usd: float) -> None:
    sep = "=" * 60
    print(f"\n{sep}")
    print(f"💬🏦  KONUŞMA BİTİMİ — {label}")
    print(sep)
    for k, v in details.items():
        print(f"   {k}: {v}")
    print(f"   💰 TOPLAM MALİYET : ${total_usd:.6f} USD")
    print(f"{sep}\n")
