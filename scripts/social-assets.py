"""Generate original diagram-based social cards (Pillow required only to regenerate)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]
font=str(root/'assets/fonts/DMSans.ttf')
def f(size): return ImageFont.truetype(font,size)
for slug,eyebrow,lines,sub in [
 ('home','AI SYSTEMS FOR SOFTWARE ENGINEERS',['Build intuition.','One experiment at a time.'],'No GPU. No setup. No sign-up.'),
 ('kv','01 / KV CACHE',['The model fits.','Does the conversation?'],'Context length x concurrency = memory pressure.'),
 ('batch','02 / CONTINUOUS BATCHING',['Why is this','GPU slot waiting?'],'Six requests. Two slots. One scheduling decision.'),
 ('spec','03 / SPECULATIVE DECODING',['More guesses.','Always faster?'],'Find when drafting costs more than it saves.')]:
 im=Image.new('RGB',(1200,630),'#191f1c');d=ImageDraw.Draw(im)
 d.text((54,42),'infra lab',font=f(28),fill='#dce9d2');d.text((54,115),eyebrow,font=f(16),fill='#b6d5a1')
 for i,line in enumerate(lines):d.text((50,170+i*66),line,font=f(54),fill='#fffefa')
 d.text((54,332),sub,font=f(22),fill='#b7c2ab')
 if slug in ['home','kv']:
  for i in range(24):d.rounded_rectangle((54+i*45,410,91+i*45,450),radius=5,fill='#b6d5a1' if i<13 else '#dfa77e' if i<21 else '#43523b')
  d.text((54,468),'WEIGHTS',font=f(14),fill='#b6d5a1');d.text((640,468),'KV CACHE',font=f(14),fill='#dfa77e')
 elif slug=='batch':
  for y in range(2):
   for i in range(24):d.rounded_rectangle((54+i*45,405+y*43,91+i*45,437+y*43),radius=4,fill='#b6d5a1' if (i+y*3)%10<6 else '#dfa77e' if y else '#43523b')
 else:
  for i,n in enumerate(['1.00','0.80','0.64','0.51','0.41']):
   x=54+i*150;d.rounded_rectangle((x,402,x+132,472),radius=8,fill='#364632');d.text((x+25,421),n,font=f(28),fill='#b6d5a1')
 d.line((54,535,1146,535),fill='#43503c',width=1);d.text((54,559),'INTERACTIVE TEACHING SIMULATIONS / EN + ZH',font=f(15),fill='#a9b69e');d.text((994,559),'INFRA LAB',font=f(17),fill='#dce9d2')
 im.save(root/'assets'/('social-'+slug+'.png'))
