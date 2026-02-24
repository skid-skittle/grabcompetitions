from __future__ import annotations

from pathlib import Path


def main() -> None:
    server_path = Path(__file__).with_name("server.py")
    raw = server_path.read_text(encoding="utf-8", errors="ignore")

    start = raw.find("from fastapi import")
    if start == -1:
        raise SystemExit("Could not find 'from fastapi import' in server.py")

    raw = raw[start:]

    footer = raw.rfind("Observation: Overwrite successful")
    if footer != -1:
        raw = raw[:footer]

    raw = raw.strip()

    if raw.startswith('"'):
        raw = raw[1:]
    if raw.endswith('"'):
        raw = raw[:-1]

    raw = raw.replace("\\\"", '"')
    raw = raw.replace("\r\n", "\n")

    server_path.write_text(raw + "\n", encoding="utf-8")
    print("Cleaned server.py")


if __name__ == "__main__":
    main()
