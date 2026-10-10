import sys
import json
import traceback

def search(query, max_results=5):
    try:
        from ddgs import DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS
        except ImportError:
            return {"success": False, "error": "ddgs package not found", "results": []}

    try:
        results = []
        with DDGS() as ddgs:
            raw = list(ddgs.text(query, max_results=max_results))
            for item in raw:
                title = item.get("title", "")
                body = item.get("body", "")
                href = item.get("href", "")
                if title or body:
                    results.append({
                        "title": title,
                        "snippet": body,
                        "url": href
                    })

        return {
            "success": True,
            "query": query,
            "results": results
        }
    except Exception as e:
        return {
            "success": False,
            "query": query,
            "error": str(e),
            "results": []
        }

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

    query = ""
    max_results = 5

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        try:
            payload = json.loads(sys.stdin.read())
            query = payload.get("query", "")
            max_results = payload.get("max_results", 5)
        except Exception:
            pass

    if not query.strip():
        print(json.dumps({"success": False, "error": "Empty query", "results": []}))
        return

    output = search(query.strip(), max_results=max_results)
    print(json.dumps(output, ensure_ascii=False))

if __name__ == "__main__":
    main()
