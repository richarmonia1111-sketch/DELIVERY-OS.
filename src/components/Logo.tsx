import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light';
  showText?: boolean;
  to?: string | null;
  className?: string;
  name?: string;
  tagline?: string;
}

const SIZE_MAP = {
  sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2' },
  md: { icon: 36, text: 'text-base', sub: 'text-[10px]', gap: 'gap-2.5' },
  lg: { icon: 44, text: 'text-lg', sub: 'text-[10px]', gap: 'gap-2.5' },
  xl: { icon: 56, text: 'text-xl', sub: 'text-[11px]', gap: 'gap-3' },
};

export function LogoIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Bici Express"
    >
      <defs>
        <linearGradient id="bici-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#1a2a4a' }} />
          <stop offset="100%" style={{ stopColor: '#0f1e38' }} />
        </linearGradient>
        <linearGradient id="bici-box" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'var(--color-bici-primary-600, #16a34a)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-bici-primary-700, #15803d)' }} />
        </linearGradient>
        <linearGradient id="bici-speed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'var(--color-bici-primary-600, #16a34a)', stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: 'var(--color-bici-primary-600, #16a34a)', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      <rect width="1024" height="1024" rx="220" ry="220" fill="url(#bici-bg)" />
      <rect width="1024" height="500" rx="220" ry="220" fill="white" opacity="0.03" />

      <rect x="70" y="420" width="250" height="18" rx="9" fill="url(#bici-speed)" opacity="0.85" />
      <rect x="50" y="462" width="210" height="14" rx="7" fill="url(#bici-speed)" opacity="0.65" />
      <rect x="90" y="500" width="170" height="11" rx="5" fill="url(#bici-speed)" opacity="0.45" />
      <rect x="70" y="382" width="160" height="11" rx="5" fill="url(#bici-speed)" opacity="0.4" />

      <rect x="340" y="185" width="220" height="220" rx="24" ry="24" fill="url(#bici-box)" />
      <rect x="340" y="185" width="220" height="42" rx="24" ry="24" fill="var(--color-bici-primary-400, #4ade80)" opacity="0.55" />
      <rect x="340" y="207" width="220" height="20" fill="var(--color-bici-primary-400, #4ade80)" opacity="0.55" />
      <rect x="340" y="227" width="220" height="5" rx="2.5" fill="var(--color-bici-primary-700, #15803d)" opacity="0.4" />

      <text x="450" y="365" fontFamily="'Arial Rounded MT Bold', 'Arial', sans-serif" fontSize="148" fontWeight="900" fill="white" textAnchor="middle" opacity="0.95" letterSpacing="-2">B</text>

      <path d="M 440 405 Q 435 435 433 455" stroke="var(--color-bici-primary-700, #15803d)" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 510 405 Q 515 432 518 453" stroke="var(--color-bici-primary-700, #15803d)" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.85" />

      <circle cx="552" cy="285" r="58" fill="#d4e1f7" />
      <path d="M 514 258 Q 518 238 554 236 Q 592 236 610 254 Q 620 266 616 274 L 496 281 Z" fill="#1a2a4a" />
      <path d="M 496 281 Q 484 290 484 298 Q 512 294 496 281 Z" fill="#1a2a4a" />

      <path d="M 538 368 Q 492 388 450 452 Q 442 472 452 488 Q 472 502 500 490 Q 532 470 558 450 Q 590 428 605 413 Q 615 398 610 380 Q 598 358 568 363 Z" fill="#1a2a4a" />

      <path d="M 458 470 Q 436 488 420 508 Q 408 522 412 534 Q 420 544 436 536 Q 452 518 468 500 Z" fill="#1a2a4a" />
      <path d="M 430 533 Q 416 550 404 566 Q 396 578 400 588 Q 408 596 418 592 Q 432 578 446 558 Q 454 546 446 534 Z" fill="#b8cde8" />
      <ellipse cx="406" cy="592" rx="18" ry="14" fill="#b8cde8" />

      <path d="M 496 488 Q 516 508 528 543 Q 536 566 526 580 Q 514 592 498 584 Q 480 574 474 550 Q 466 523 478 503 Z" fill="#1a2a4a" />
      <path d="M 513 578 Q 520 606 518 636 Q 516 658 504 668 Q 490 676 480 666 Q 472 654 478 634 Q 484 608 496 588 Z" fill="#1a2a4a" />
      <path d="M 474 666 Q 454 672 438 674 Q 426 676 424 684 Q 428 696 446 696 Q 466 696 486 688 Q 502 680 502 668 Z" fill="#1a2a4a" />
      <path d="M 486 490 Q 466 514 462 546 Q 458 570 472 584 Q 486 596 500 588 Q 516 578 518 554 Q 522 526 508 504 Z" fill="#2c3e6a" />
      <path d="M 474 582 Q 464 610 466 642 Q 468 664 480 672 Q 494 680 504 670 Q 512 658 508 636 Q 504 612 508 586 Z" fill="#2c3e6a" />
      <path d="M 478 670 Q 498 678 516 680 Q 530 682 532 690 Q 528 702 510 702 Q 490 702 470 694 Q 456 686 458 672 Z" fill="#2c3e6a" />

      <circle cx="380" cy="710" r="142" fill="none" stroke="#d4e1f7" strokeWidth="26" />
      <circle cx="380" cy="710" r="26" fill="#d4e1f7" />
      <circle cx="380" cy="710" r="13" fill="#0f1e38" />
      <line x1="380" y1="568" x2="380" y2="852" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="238" y1="710" x2="522" y2="710" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="280" y1="610" x2="480" y2="810" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="480" y1="610" x2="280" y2="810" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />

      <circle cx="710" cy="710" r="142" fill="none" stroke="#d4e1f7" strokeWidth="26" />
      <circle cx="710" cy="710" r="26" fill="#d4e1f7" />
      <circle cx="710" cy="710" r="13" fill="#0f1e38" />
      <line x1="710" y1="568" x2="710" y2="852" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="568" y1="710" x2="852" y2="710" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="610" y1="610" x2="810" y2="810" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />
      <line x1="810" y1="610" x2="610" y2="810" stroke="#d4e1f7" strokeWidth="8" opacity="0.45" />

      <line x1="380" y1="710" x2="510" y2="672" stroke="#d4e1f7" strokeWidth="24" strokeLinecap="round" />
      <line x1="510" y1="672" x2="630" y2="568" stroke="#d4e1f7" strokeWidth="24" strokeLinecap="round" />
      <line x1="556" y1="540" x2="630" y2="568" stroke="#d4e1f7" strokeWidth="20" strokeLinecap="round" />
      <line x1="630" y1="568" x2="710" y2="710" stroke="#d4e1f7" strokeWidth="24" strokeLinecap="round" />

      <circle cx="510" cy="672" r="28" fill="#d4e1f7" />
      <circle cx="510" cy="672" r="15" fill="#1a2a4a" />
      <line x1="510" y1="672" x2="478" y2="698" stroke="#d4e1f7" strokeWidth="16" strokeLinecap="round" />
      <line x1="510" y1="672" x2="542" y2="646" stroke="#d4e1f7" strokeWidth="16" strokeLinecap="round" />
      <rect x="454" y="694" width="50" height="16" rx="7" fill="#d4e1f7" />
      <rect x="532" y="638" width="50" height="16" rx="7" fill="#d4e1f7" />

      <line x1="548" y1="452" x2="556" y2="540" stroke="#d4e1f7" strokeWidth="18" strokeLinecap="round" />
      <path d="M 518 452 Q 548 440 582 446 Q 594 452 588 462 Q 572 470 548 468 Q 522 466 514 458 Z" fill="#d4e1f7" />
      <line x1="630" y1="568" x2="622" y2="524" stroke="#d4e1f7" strokeWidth="18" strokeLinecap="round" />
      <path d="M 596 522 Q 622 514 650 522" stroke="#d4e1f7" strokeWidth="16" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({
  size = 'md',
  variant = 'dark',
  showText = true,
  to = '/',
  className = '',
  name = 'Bici Express',
  tagline = 'OS',
}: LogoProps) {
  const s = SIZE_MAP[size];
  const textColor = variant === 'light' ? 'text-white' : 'text-slate-900';
  const subColor = variant === 'light' ? 'text-bici-primary-300' : 'text-bici-primary-600';

  const content = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoIcon size={s.icon} className="shrink-0 rounded-xl shadow-sm" />
      {showText && (
        <span className="flex flex-col leading-none">
          <span className={`font-display ${s.text} font-bold ${textColor}`}>{name}</span>
          <span className={`${s.sub} font-semibold uppercase tracking-wider ${subColor}`}>{tagline}</span>
        </span>
      )}
    </span>
  );

  if (to === null) return content;
  return <Link to={to}>{content}</Link>;
}
