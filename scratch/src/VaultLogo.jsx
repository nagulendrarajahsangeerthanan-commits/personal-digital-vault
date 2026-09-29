export default function VaultLogo() {
  return (
    <svg 
      className="brand-svg-logo" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vaultGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38bdf8" />
          <stop offset="1" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      
      
      <path
        d="M20 3L6 8.5V18C6 27.5 12 35.5 20 38C28 35.5 34 27.5 34 18V8.5L20 3Z"
        fill="url(#vaultGradient)"
        fillOpacity="0.15"
        stroke="#38bdf8"
        strokeWidth="2"
      />
      
      
      <circle cx="20" cy="21" r="7" stroke="#38bdf8" strokeWidth="2" />
      <circle cx="20" cy="21" r="2.5" fill="#38bdf8" />
      
    
      <line x1="20" y1="12" x2="20" y2="14" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="28" x2="20" y2="30" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="21" x2="13" y2="21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
      <line x1="27" y1="21" x2="29" y2="21" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}