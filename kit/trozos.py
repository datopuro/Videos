import re
STOP = {"del", "tan", "muy", "y", "te", "al", "de", "la", "el", "que", "en", "a", "un", "con", "los", "las", "o", "no", "son", "por", "para", "si", "ya", "se", "le", "lo", "esa", "aunque", "hayas"}


def trozos(frase, max_car=24):
    pals = frase.split(" ")
    n = len(pals)

    def costo(i, j):
        g = pals[i:j]
        txt = " ".join(g)
        if len(txt) > max_car and len(g) > 1:
            return 1e9
        c = (len(txt) - 15) ** 2 * 0.6
        if len(g) > 5:
            c += 400
        if any(re.search(r"[,:.…?]$", p) for p in g[:-1]):
            c += 300
        if g[-1].lower().strip(",.:;…?¿") in STOP and j < n:
            c += 900
        if len(g) == 1 and not re.search(r"[,:.…?]$", g[0]):
            c += 500
        if len(g) == 1 and len(g[0]) < 7:
            c += 300
        if len(g) == 1 and len(g[0]) < 10:
            c += 150
        return c

    best = [0.0] + [1e18] * n
    prev = [0] * (n + 1)
    for j in range(1, n + 1):
        for i in range(max(0, j - 6), j):
            v = best[i] + costo(i, j)
            if re.search(r"[,:.…?]$", pals[j - 1]):
                v -= 60
            if v < best[j]:
                best[j], prev[j] = v, i
    out, j = [], n
    while j > 0:
        out.append(" ".join(pals[prev[j]:j]))
        j = prev[j]
    return out[::-1]
