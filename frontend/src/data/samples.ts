// Sample Data for Prescriptions, Injuries, and Lab Reports

export interface SamplePrescription {
  id: string;
  title: string;
  subtitle: string;
  doctorName: string;
  dataUrl: string;
}

export interface SampleInjury {
  id: string;
  title: string;
  description: string;
  category: string;
  dataUrl: string;
}

export interface SampleLabReport {
  id: string;
  title: string;
  subtitle: string;
  reportType: string;
  dataUrl: string;
}

// 1. Prescription Sample 1: Viral Fever & Infection
const rxSvg1 = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#FFFFFF"/>
  <rect x="20" y="20" width="760" height="960" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <path d="M 40 130 L 760 130" stroke="#0284C7" stroke-width="3"/>
  <text x="40" y="65" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#0369A1">CITY CARE MULTISPECIALITY CLINIC</text>
  <text x="40" y="95" font-family="Arial, sans-serif" font-size="16" fill="#475569">Dr. Rajesh Varma, MD (Internal Medicine), Reg No: 58241</text>
  <text x="40" y="115" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Ph: +91 40-27654321 | 14-B Banjara Hills, Hyderabad</text>
  <rect x="40" y="150" width="720" height="60" fill="#F8FAFC" rx="6"/>
  <text x="60" y="185" font-family="Arial, sans-serif" font-size="15" fill="#334155">Patient: Ramesh Kumar | Age: 34 yrs | Date: 12-Oct-2026</text>
  <text x="60" y="202" font-family="Arial, sans-serif" font-size="14" fill="#64748B">Diagnosis: Acute Upper Respiratory Infection, High Fever (102°F), Body Pain</text>
  <text x="40" y="280" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#0284C7">℞</text>
  <text x="100" y="275" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">1. Tab. Dolo 650 mg (Paracetamol)</text>
  <text x="120" y="302" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 tablet TDS (3 times a day) after food for 4 days</text>
  <text x="100" y="370" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">2. Cap. Augmentin 625 mg (Amoxicillin + Clavulanic Acid)</text>
  <text x="120" y="397" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 capsule BD (Morning &amp; Night) after meals for 5 days</text>
  <text x="100" y="465" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">3. Tab. Montair-LC (Montelukast + Levocetirizine)</text>
  <text x="120" y="492" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 tablet at night (HS) before sleep for 5 days</text>
  <rect x="40" y="660" width="720" height="150" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1" rx="8"/>
  <text x="60" y="695" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#1E40AF">General Advice &amp; Warnings:</text>
  <text x="60" y="725" font-family="Arial, sans-serif" font-size="14" fill="#1E3A8A">• Drink at least 2.5 - 3 liters of warm water daily.</text>
  <text x="60" y="750" font-family="Arial, sans-serif" font-size="14" fill="#1E3A8A">• Review after 5 days if fever persists above 101°F.</text>
</svg>`;

// 2. Prescription Sample 2: Hypertension & Diabetes
const rxSvg2 = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#FFFFFF"/>
  <rect x="20" y="20" width="760" height="960" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <path d="M 40 130 L 760 130" stroke="#059669" stroke-width="3"/>
  <text x="40" y="65" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#047857">METRO HEART &amp; DIABETES CENTER</text>
  <text x="40" y="95" font-family="Arial, sans-serif" font-size="16" fill="#475569">Dr. Ananya Sen, MD, DM (Cardiology), AIIMS Gold Medalist</text>
  <rect x="40" y="150" width="720" height="60" fill="#F0FDF4" rx="6"/>
  <text x="60" y="185" font-family="Arial, sans-serif" font-size="15" fill="#334155">Patient: Smt. Sunitha Devi | Age: 58 yrs | BP: 148/92 mmHg</text>
  <text x="40" y="280" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#059669">℞</text>
  <text x="100" y="275" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">1. Tab. Telmisartan 40 mg (Telma 40)</text>
  <text x="120" y="302" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 tablet OD (Once daily morning) before breakfast</text>
  <text x="100" y="375" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">2. Tab. Metformin 500 mg SR (Glycomet-SR)</text>
  <text x="120" y="402" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 tablet BD (Twice daily) immediately after major meals</text>
  <text x="100" y="475" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#0F172A">3. Tab. Atorvastatin 10 mg (Atorva 10)</text>
  <text x="120" y="502" font-family="Arial, sans-serif" font-size="15" fill="#334155">Sig: 1 tablet once daily at bedtime (night)</text>
</svg>`;

// 3. Sample Injury 1: Scald Burn
const burnSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#F5EBE6"/>
  <path d="M 120 50 Q 250 40 480 60 L 520 540 Q 280 560 100 520 Z" fill="#E8C39E"/>
  <ellipse cx="320" cy="280" rx="90" ry="65" fill="#EF4444" opacity="0.65"/>
  <ellipse cx="320" cy="280" rx="70" ry="50" fill="#DC2626" opacity="0.75"/>
  <ellipse cx="335" cy="265" rx="35" ry="25" fill="#FCA5A5" opacity="0.9"/>
  <ellipse cx="310" cy="290" rx="20" ry="15" fill="#FEF08A" opacity="0.8" stroke="#FBBF24" stroke-width="2"/>
  <text x="30" y="580" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#991B1B">Forearm Hot Water Scald (Erythema &amp; Blister)</text>
</svg>`;

// 4. Sample Injury 2: Knee Scrape
const scrapeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#FAF5EF"/>
  <ellipse cx="300" cy="300" rx="220" ry="200" fill="#DEC0A2"/>
  <path d="M 230 250 Q 280 220 370 260 Q 390 320 330 360 Q 250 350 230 250 Z" fill="#B91C1C" opacity="0.8"/>
  <path d="M 250 270 Q 290 280 340 310" stroke="#7F1D1D" stroke-width="5" stroke-linecap="round"/>
  <circle cx="280" cy="300" r="8" fill="#450A0A"/>
  <text x="30" y="580" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#7F1D1D">Superficial Abrasion / Fall Scrape with Minor Bleeding</text>
</svg>`;

// 5. Sample Injury 3: Insect Sting
const stingSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <circle cx="300" cy="300" r="220" fill="#E2BD96"/>
  <circle cx="300" cy="300" r="90" fill="#F87171" opacity="0.5"/>
  <circle cx="300" cy="300" r="45" fill="#EF4444" opacity="0.75"/>
  <circle cx="300" cy="300" r="16" fill="#FEF08A" opacity="0.95"/>
  <text x="30" y="580" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#991B1B">Insect Sting / Wheal with Local Erythema</text>
</svg>`;

// 6. Sample Lab Report 1: Complete Blood Count & Dengue Platelets
const labSvg1 = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#FFFFFF"/>
  <rect x="25" y="25" width="750" height="950" fill="#FFFFFF" stroke="#0284C7" stroke-width="2"/>
  <text x="50" y="70" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#0369A1">APOLLO DIAGNOSTICS &amp; PATHOLOGY LAB</text>
  <text x="50" y="95" font-family="Arial, sans-serif" font-size="13" fill="#64748B">NABL Accredited • ISO 15189 Certified • Reg: DL-88419</text>
  <line x1="50" y1="110" x2="750" y2="110" stroke="#CBD5E1" stroke-width="1.5"/>
  <rect x="50" y="125" width="700" height="60" fill="#F0F9FF" rx="4"/>
  <text x="65" y="150" font-family="Arial, sans-serif" font-size="14" fill="#0F172A">Patient: <b>Pooja Sharma</b> | Age: 29 Y / Female | Date: 08-Oct-2026</text>
  <text x="65" y="172" font-family="Arial, sans-serif" font-size="13" fill="#475569">Ref by: Dr. V. Rao | Sample: Whole Blood EDTA (CBC Test)</text>
  
  <!-- Table Header -->
  <rect x="50" y="210" width="700" height="35" fill="#E2E8F0"/>
  <text x="65" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">INVESTIGATION</text>
  <text x="320" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">RESULT</text>
  <text x="440" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">UNITS</text>
  <text x="560" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">NORMAL RANGE</text>
  
  <!-- Test Rows -->
  <text x="65" y="280" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Hemoglobin (Hb)</text>
  <text x="320" y="280" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B91C1C">10.1 (LOW)</text>
  <text x="440" y="280" font-family="Arial, sans-serif" font-size="14" fill="#475569">g/dL</text>
  <text x="560" y="280" font-family="Arial, sans-serif" font-size="14" fill="#475569">12.0 - 15.5</text>
  
  <text x="65" y="330" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Total WBC Count (TLC)</text>
  <text x="320" y="330" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#047857">6,800</text>
  <text x="440" y="330" font-family="Arial, sans-serif" font-size="14" fill="#475569">/cu.mm</text>
  <text x="560" y="330" font-family="Arial, sans-serif" font-size="14" fill="#475569">4,000 - 11,000</text>
  
  <text x="65" y="380" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Platelet Count</text>
  <text x="320" y="380" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B91C1C">92,000 (LOW)</text>
  <text x="440" y="380" font-family="Arial, sans-serif" font-size="14" fill="#475569">/cu.mm</text>
  <text x="560" y="380" font-family="Arial, sans-serif" font-size="14" fill="#475569">150,000 - 450,000</text>
  
  <text x="65" y="430" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">RBC Count</text>
  <text x="320" y="430" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#047857">4.1</text>
  <text x="440" y="430" font-family="Arial, sans-serif" font-size="14" fill="#475569">mil/cu.mm</text>
  <text x="560" y="430" font-family="Arial, sans-serif" font-size="14" fill="#475569">3.8 - 5.2</text>
  
  <rect x="50" y="520" width="700" height="120" fill="#FEF2F2" stroke="#F87171" rx="6"/>
  <text x="70" y="555" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#991B1B">Pathologist Impression &amp; Critical Alert:</text>
  <text x="70" y="585" font-family="Arial, sans-serif" font-size="13" fill="#7F1D1D">• Thrombocytopenia (Platelets 92,000) noted. Check for Dengue NS1 / Viral fever.</text>
  <text x="70" y="610" font-family="Arial, sans-serif" font-size="13" fill="#7F1D1D">• Mild Microcytic Hypochromic Anemia (Hb 10.1). Iron profile recommended.</text>
</svg>`;

// 7. Sample Lab Report 2: Lipid Profile & Fasting Blood Sugar
const labSvg2 = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <rect width="800" height="1000" fill="#FFFFFF"/>
  <rect x="25" y="25" width="750" height="950" fill="#FFFFFF" stroke="#059669" stroke-width="2"/>
  <text x="50" y="70" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#047857">THYROCARE WELLNESS &amp; BIOCHEMISTRY</text>
  <text x="50" y="95" font-family="Arial, sans-serif" font-size="13" fill="#64748B">Central Clinical Lab • ISO 9001:2015</text>
  <line x1="50" y1="110" x2="750" y2="110" stroke="#CBD5E1" stroke-width="1.5"/>
  <rect x="50" y="125" width="700" height="60" fill="#F0FDF4" rx="4"/>
  <text x="65" y="150" font-family="Arial, sans-serif" font-size="14" fill="#0F172A">Patient: <b>K. Venkatesh</b> | Age: 48 Y / Male | Date: 07-Oct-2026</text>
  <text x="65" y="172" font-family="Arial, sans-serif" font-size="13" fill="#475569">Fasting Status: 12 Hours Overnight Fasting</text>
  
  <rect x="50" y="210" width="700" height="35" fill="#E2E8F0"/>
  <text x="65" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">LIPID &amp; GLUCOSE TEST</text>
  <text x="320" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">RESULT</text>
  <text x="440" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">UNITS</text>
  <text x="560" y="233" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#1E293B">DESIRABLE</text>
  
  <text x="65" y="280" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Fasting Blood Sugar (FBS)</text>
  <text x="320" y="280" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B91C1C">142 (HIGH)</text>
  <text x="440" y="280" font-family="Arial, sans-serif" font-size="14" fill="#475569">mg/dL</text>
  <text x="560" y="280" font-family="Arial, sans-serif" font-size="14" fill="#475569">70 - 99</text>
  
  <text x="65" y="330" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Total Cholesterol</text>
  <text x="320" y="330" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B91C1C">248 (HIGH)</text>
  <text x="440" y="330" font-family="Arial, sans-serif" font-size="14" fill="#475569">mg/dL</text>
  <text x="560" y="330" font-family="Arial, sans-serif" font-size="14" fill="#475569">&lt; 200</text>
  
  <text x="65" y="380" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">Triglycerides</text>
  <text x="320" y="380" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#B91C1C">210 (HIGH)</text>
  <text x="440" y="380" font-family="Arial, sans-serif" font-size="14" fill="#475569">mg/dL</text>
  <text x="560" y="380" font-family="Arial, sans-serif" font-size="14" fill="#475569">&lt; 150</text>
  
  <text x="65" y="430" font-family="Arial, sans-serif" font-size="14" fill="#1E293B">HDL Cholesterol (Good)</text>
  <text x="320" y="430" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#047857">42</text>
  <text x="440" y="430" font-family="Arial, sans-serif" font-size="14" fill="#475569">mg/dL</text>
  <text x="560" y="430" font-family="Arial, sans-serif" font-size="14" fill="#475569">&gt; 40</text>
</svg>`;

export const SAMPLE_PRESCRIPTIONS: SamplePrescription[] = [
  {
    id: 'rx-fever',
    title: 'Fever & Infection Prescription',
    subtitle: 'Paracetamol, Amoxicillin, Antiallergic',
    doctorName: 'Dr. Rajesh Varma (Internal Medicine)',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(rxSvg1)}`,
  },
  {
    id: 'rx-cardio',
    title: 'BP & Diabetes Prescription',
    subtitle: 'Telmisartan, Metformin SR, Atorvastatin',
    doctorName: 'Dr. Ananya Sen (Cardiology)',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(rxSvg2)}`,
  },
];

export const SAMPLE_INJURIES: SampleInjury[] = [
  {
    id: 'burn-scald',
    title: 'Hot Water Burn / Scald',
    description: 'Redness and small blister on forearm after kitchen splash',
    category: 'Burns',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(burnSvg)}`,
  },
  {
    id: 'scrape-knee',
    title: 'Knee Scrape / Abrasion',
    description: 'Road gravel scrape from falling with capillary bleeding',
    category: 'Cuts & Bleeding',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(scrapeSvg)}`,
  },
  {
    id: 'insect-sting',
    title: 'Bee / Wasp Sting',
    description: 'Red swollen localized wheal with central puncture site',
    category: 'Bites & Stings',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(stingSvg)}`,
  },
];

export const SAMPLE_LAB_REPORTS: SampleLabReport[] = [
  {
    id: 'lab-cbc',
    title: 'Complete Blood Count (CBC) & Platelets',
    subtitle: 'Low Platelets (92,000) & Mild Anemia (Hb 10.1)',
    reportType: 'Hematology',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(labSvg1)}`,
  },
  {
    id: 'lab-lipid-sugar',
    title: 'Lipid Profile & Fasting Sugar (FBS)',
    subtitle: 'High Fasting Sugar (142 mg/dL) & High Cholesterol (248)',
    reportType: 'Biochemistry',
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(labSvg2)}`,
  },
];
