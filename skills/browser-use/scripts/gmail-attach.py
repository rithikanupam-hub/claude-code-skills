# Attach local files to an open Gmail compose/draft without a file picker.
# Run inside the browser-use CLI heredoc after switch_tab(<gmail tab id>).
# Edit FILES; Gmail accepts up to ~25 MB of attachments per message.
import time, os
FILES = ["/absolute/path/one.mp4", "/absolute/path/two.mp4"]
for f in FILES: assert os.path.exists(f), f
root = cdp("DOM.getDocument", depth=0)["root"]["nodeId"]
nid = cdp("DOM.querySelectorAll", nodeId=root, selector='input[type=file]')["nodeIds"][-1]  # Gmail's hidden name="Filedata" input
cdp("DOM.setFileInputFiles", files=FILES, nodeId=nid)
for i in range(30):
    time.sleep(5)
    st = js("""(() => { const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.querySelector('input[name=subjectbox]')); if(!d) return 'nodialog'; return 'bars='+d.querySelectorAll('[role="progressbar"]').length+' names='+d.innerText.split('\\n').filter(l=>/\\.(mp4|pdf|png|zip)/.test(l)).join(' | '); })()""")
    print(i, st)
    if st.startswith('bars=0') and 'names=' in st and st.split('names=')[1]: break
