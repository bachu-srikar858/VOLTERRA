import fs from 'fs';
import path from 'path';

const COMPONENTS = [
  'SplitText-TS-TW',
  'BlurText-TS-TW',
  'ScrollReveal-TS-TW',
  'AnimatedContent-TS-TW',
  'TiltedCard-TS-TW',
  'Counter-TS-TW',
  'Stepper-TS-TW',
  'TextLoop-TS-TW',
  'FadeContent-TS-TW',
  'ScrollVelocity-TS-TW',
  'RotatingText-TS-TW',
  'ShinyText-TS-TW',
];

const outDir = path.resolve('src/components/ReactBits');
fs.mkdirSync(outDir, { recursive: true });

for (const name of COMPONENTS) {
  const res = await fetch(`https://reactbits.dev/r/${name}.json`);
  if (!res.ok) { console.error('FAIL', name, res.status); continue; }
  const item = await res.json();
  const file = item.files[0];
  const cleanName = name.replace(/-TS-TW$/, '');
  const target = path.join(outDir, `${cleanName}.tsx`);
  fs.writeFileSync(target, file.content);
  console.log('OK', cleanName);
}
