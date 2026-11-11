# Tally the current ITDOG /http/ result table (run inside browser-use after a test finishes)
rows=js("""JSON.stringify([...document.querySelectorAll('table tr')].map(r=>[...r.cells].map(c=>c.innerText.trim())).filter(c=>c.length>=6 && /失败|正常|^\\d{3}/.test(c[3])))""")
import json, collections
rows=json.loads(rows)
def region(n): return 'HK/MO/TW/overseas' if any(k in n for k in ['香港','澳门','台湾','海外','美国','日本','新加坡','韩国','德国','英国']) else 'mainland'
c=collections.Counter(); ips=collections.Counter(); ok_times=[]
for r in rows:
    g=region(r[0]); ok = r[3]!='失败' and not r[3].startswith('失败')
    c[(g,'ok' if ok else 'fail')]+=1
    if g=='mainland': ips[r[2].split('/')[-1] if '/' in r[2] else r[2]]+=1
    if ok and g=='mainland':
        try: ok_times.append(float(r[4].rstrip('s')))
        except: pass
print("target:", js("document.getElementById('host').value"), "| rows:", len(rows))
print(dict(c))
print("mainland IP owners:", ips.most_common(6))
if ok_times: print("mainland OK total time: min %.2f avg %.2f max %.2f" % (min(ok_times), sum(ok_times)/len(ok_times), max(ok_times)))
print("status sample:", collections.Counter(r[3] for r in rows).most_common(5))
