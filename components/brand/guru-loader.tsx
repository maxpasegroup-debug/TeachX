type GuruLoaderProps = {
  label?: string;
};

const loaderStyles = `
.guru-loader { position: relative; display: grid; height: 15rem; width: 12rem; place-items: center; }
.guru-loader-glow { position: absolute; top: 1.25rem; height: 9rem; width: 9rem; border-radius: 9999px; background: radial-gradient(circle, rgba(215, 240, 11, 0.5), rgba(252, 170, 29, 0.16) 46%, transparent 70%); }
.guru-loader-mark { position: relative; height: 11rem; width: auto; animation: guru-float 1.8s ease-in-out infinite; }
.guru-loader-shadow { position: absolute; bottom: 2.15rem; height: 0.7rem; width: 5.25rem; border-radius: 9999px; background: rgba(111, 59, 144, 0.22); animation: guru-shadow 1.8s ease-in-out infinite; }
.guru-loader-dots { position: absolute; bottom: 0; display: flex; gap: 0.45rem; }
.guru-loader-dots span { height: 0.45rem; width: 0.45rem; border-radius: 9999px; animation: guru-dot 1.2s ease-in-out infinite; }
.guru-loader-dots span:nth-child(1) { background: #6f3b90; }
.guru-loader-dots span:nth-child(2) { background: #fcaa1d; animation-delay: 0.15s; }
.guru-loader-dots span:nth-child(3) { background: #d7f00b; animation-delay: 0.3s; }
@keyframes guru-float { 0%, 100% { transform: translateY(6px); } 50% { transform: translateY(-8px); } }
@keyframes guru-shadow { 0%, 100% { transform: scaleX(1); opacity: 0.55; } 50% { transform: scaleX(0.72); opacity: 0.28; } }
@keyframes guru-dot { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(-4px); opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .guru-loader-mark, .guru-loader-shadow, .guru-loader-dots span { animation: none; }
}
`;

export function GuruLoader({ label }: GuruLoaderProps) {
  return (
    <div aria-hidden={label ? undefined : true} className="guru-loader" role={label ? "status" : undefined}>
      <style>{loaderStyles}</style>
      <span className="guru-loader-glow" aria-hidden="true" />
      <img alt="" className="guru-loader-mark" height={463} src="/brand/loader-mark.png" width={351} />
      <span className="guru-loader-shadow" aria-hidden="true" />
      <span className="guru-loader-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
