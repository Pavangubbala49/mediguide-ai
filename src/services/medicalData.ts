// MediGuide AI - Core Medical Service & Database

export interface Symptom {
  id: string;
  name: { [lang: string]: string };
  category: 'general' | 'respiratory' | 'digestive' | 'skin' | 'neurological' | 'psychological';
}

export interface Disease {
  id: string;
  name: { [lang: string]: string };
  symptoms: string[]; // symptom IDs
  severity: 'low' | 'medium' | 'high';
  specialist: string; // Specialist name key
  possibleCauses: { [lang: string]: string[] };
  nextSteps: { [lang: string]: string[] };
}

export interface Medicine {
  name: string;
  category: string;
  uses: { [lang: string]: string };
  sideEffects: { [lang: string]: string };
  precautions: { [lang: string]: string };
  storage: { [lang: string]: string };
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  phone: string;
  specialties: string[];
  distance: number; // in km
  directions: { [lang: string]: string };
  isEmergency: boolean;
}

export interface DiagnosisReport {
  id: string;
  timestamp: string;
  age: number;
  gender: string;
  selectedSymptoms: string[];
  duration: string;
  severity: string;
  conditions: string;
  predictions: { diseaseId: string; confidence: number }[];
  recommendedSpecialist: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

// 1. Symptoms Database
export const SYMPTOMS: Symptom[] = [
  { id: 'fever', name: { en: 'Fever', es: 'Fiebre', hi: 'बुखार' }, category: 'general' },
  { id: 'cough', name: { en: 'Cough', es: 'Tos', hi: 'खांसी' }, category: 'respiratory' },
  { id: 'headache', name: { en: 'Headache', es: 'Dolor de cabeza', hi: 'सिरदर्द' }, category: 'neurological' },
  { id: 'chest_pain', name: { en: 'Chest Pain', es: 'Dolor de pecho', hi: 'छाती में दर्द' }, category: 'respiratory' },
  { id: 'shortness_of_breath', name: { en: 'Shortness of Breath', es: 'Falta de aliento', hi: 'सांस की तकलीफ' }, category: 'respiratory' },
  { id: 'skin_rash', name: { en: 'Skin Rash', es: 'Erupción cutánea', hi: 'त्वचा पर चकत्ते' }, category: 'skin' },
  { id: 'itching', name: { en: 'Itching', es: 'Picazón', hi: 'खुजली' }, category: 'skin' },
  { id: 'joint_pain', name: { en: 'Joint Pain', es: 'Dolor en las articulaciones', hi: 'जोड़ों का दर्द' }, category: 'general' },
  { id: 'sore_throat', name: { en: 'Sore Throat', es: 'Dolor de garganta', hi: 'गले में खराश' }, category: 'respiratory' },
  { id: 'fatigue', name: { en: 'Fatigue / Weakness', es: 'Fatiga / Debilidad', hi: 'थकान / कमजोरी' }, category: 'general' },
  { id: 'nausea', name: { en: 'Nausea / Vomiting', es: 'Náuseas / Vómitos', hi: 'जी मिचलाना / उल्टी' }, category: 'digestive' },
  { id: 'abdominal_pain', name: { en: 'Abdominal Pain', es: 'Dolor abdominal', hi: 'पेट दर्द' }, category: 'digestive' },
  { id: 'dizziness', name: { en: 'Dizziness', es: 'Mareos', hi: 'चक्कर आना' }, category: 'neurological' },
  { id: 'anxiety', name: { en: 'Anxiety / Panic', es: 'Ansiedad / Pánico', hi: 'चिंता / घबराहट' }, category: 'psychological' },
  { id: 'heart_palpitations', name: { en: 'Heart Palpitations', es: 'Palpitaciones cardíacas', hi: 'दिल की धड़कन तेज होना' }, category: 'general' },
  { id: 'sneezing', name: { en: 'Sneezing', es: 'Estornudos', hi: 'छींक आना' }, category: 'respiratory' },
  { id: 'runny_nose', name: { en: 'Runny Nose', es: 'Goteo nasal', hi: 'बहती नाक' }, category: 'respiratory' },
  { id: 'wheezing', name: { en: 'Wheezing', es: 'Sibilancias', hi: 'घरघराहट' }, category: 'respiratory' },
  { id: 'loss_taste_smell', name: { en: 'Loss of Taste or Smell', es: 'Pérdida de gusto u olfato', hi: 'स्वाद या गंध की कमी' }, category: 'general' }
];

// 2. Diseases Database (Editable by Admin)
const DEFAULT_DISEASES: Disease[] = [
  {
    id: 'common_cold',
    name: { en: 'Common Cold', es: 'Resfriado común', hi: 'सामान्य जुकाम' },
    symptoms: ['cough', 'sore_throat', 'sneezing', 'runny_nose', 'fatigue'],
    severity: 'low',
    specialist: 'General Physician',
    possibleCauses: {
      en: ['Rhinovirus infection', 'Seasonal temperature drops', 'Weakened immune system'],
      es: ['Infección por Rinovirus', 'Cambios estacionales', 'Sistema inmune debilitado'],
      hi: ['राइनोवायरस संक्रमण', 'मौसमी तापमान में गिरावट', 'कमजोर प्रतिरक्षा प्रणाली']
    },
    nextSteps: {
      en: ['Drink plenty of fluids (warm water, herbal teas)', 'Get adequate bed rest', 'Over-the-counter pain relievers if needed (e.g., paracetamol)'],
      es: ['Beba muchos líquidos (agua tibia, tés)', 'Descanse lo suficiente', 'Analgésicos de venta libre si es necesario'],
      hi: ['खूब सारे तरल पदार्थ पीएं (गुनगुना पानी, हर्बल चाय)', 'पर्याप्त आराम करें', 'आवश्यकता होने पर दर्द निवारक दवाएं लें']
    }
  },
  {
    id: 'influenza',
    name: { en: 'Influenza (Flu)', es: 'Influenza (Gripe)', hi: 'इंफ्लूएंजा (फ्लू)' },
    symptoms: ['fever', 'cough', 'headache', 'sore_throat', 'fatigue', 'dizziness'],
    severity: 'medium',
    specialist: 'General Physician',
    possibleCauses: {
      en: ['Influenza A or B viruses', 'Direct exposure to airborne droplets'],
      es: ['Virus de la Influenza A o B', 'Exposición directa a gotitas en el aire'],
      hi: ['इन्फ्लूएंजा ए या बी वायरस', 'हवा में मौजूद बूंदों के सीधे संपर्क में आना']
    },
    nextSteps: {
      en: ['Stay home and avoid contact with others', 'Hydrate and monitor body temperature', 'Consult a doctor for antiviral prescription if symptoms are severe'],
      es: ['Quédese en casa y evite el contacto', 'Hidrátese y controle la temperatura corporal', 'Consulte a un médico para antivirales si empeora'],
      hi: ['घर पर रहें और दूसरों के संपर्क से बचें', 'हाइड्रेटेड रहें और शरीर के तापमान की निगरानी करें', 'लक्षण गंभीर होने पर एंटीवायरल के लिए डॉक्टर से सलाह लें']
    }
  },
  {
    id: 'covid19',
    name: { en: 'COVID-19', es: 'COVID-19', hi: 'कोविड-19' },
    symptoms: ['fever', 'cough', 'shortness_of_breath', 'fatigue', 'loss_taste_smell', 'headache'],
    severity: 'high',
    specialist: 'Pulmonologist / General Physician',
    possibleCauses: {
      en: ['SARS-CoV-2 coronavirus infection', 'Close aerosol contact in enclosed spaces'],
      es: ['Infección por coronavirus SARS-CoV-2', 'Contacto cercano con aerosoles'],
      hi: ['सार्स-कोव-2 कोरोनावायरस संक्रमण', 'बंद स्थानों में करीबी संपर्क']
    },
    nextSteps: {
      en: ['Isolate immediately and take a PCR/Rapid test', 'Monitor blood oxygen levels with a pulse oximeter', 'Seek emergency care if you experience difficulty breathing or chest pain'],
      es: ['Aíslese de inmediato y hágase la prueba', 'Monitoree los niveles de oxígeno en sangre', 'Busque atención de emergencia si tiene dificultad para respirar'],
      hi: ['तुरंत खुद को अलग करें और टेस्ट करवाएं', 'पल्स ऑक्सीमीटर से ऑक्सीजन स्तर की निगरानी करें', 'सांस लेने में कठिनाई होने पर तुरंत आपातकालीन सहायता लें']
    }
  },
  {
    id: 'migraine',
    name: { en: 'Migraine', es: 'Migraña', hi: 'माइग्रेन (आधा सीसी का दर्द)' },
    symptoms: ['headache', 'nausea', 'dizziness'],
    severity: 'medium',
    specialist: 'Neurologist',
    possibleCauses: {
      en: ['Neurological triggers', 'High stress or anxiety', 'Lack of sleep or hormonal changes'],
      es: ['Desencadenantes neurológicos', 'Estrés o ansiedad elevados', 'Falta de sueño o cambios hormonales'],
      hi: ['न्यूरोलॉजिकल ट्रिगर्स', 'अत्यधिक तनाव या चिंता', 'नींद की कमी या हार्मोनल बदलाव']
    },
    nextSteps: {
      en: ['Rest in a dark, quiet room', 'Apply a cold compress to the forehead', 'Take migraine-specific medication as prescribed by a neurologist'],
      es: ['Descanse en una habitación oscura y silenciosa', 'Aplique compresas frías en la frente', 'Tome medicamentos específicos para la migraña'],
      hi: ['अंधेरे, शांत कमरे में आराम करें', 'माथे पर ठंडी सिकाई करें', 'न्यूरोलॉजिस्ट द्वारा बताई गई माइग्रेन-विशिष्ट दवाएं लें']
    }
  },
  {
    id: 'hypertension',
    name: { en: 'Hypertension', es: 'Hipertensión', hi: 'उच्च रक्तचाप (हाइपरटेंशन)' },
    symptoms: ['headache', 'dizziness', 'chest_pain', 'heart_palpitations'],
    severity: 'high',
    specialist: 'Cardiologist',
    possibleCauses: {
      en: ['Chronic high sodium diet and lack of exercise', 'Genetic predisposition', 'Chronic stress'],
      es: ['Dieta alta en sodio y falta de ejercicio', 'Predisposición genética', 'Estrés crónico'],
      hi: ['भोजन में अधिक नमक और व्यायाम की कमी', 'आनुवंशिक कारण', 'क्रोनिक तनाव']
    },
    nextSteps: {
      en: ['Measure blood pressure immediately', 'Reduce sodium intake and avoid caffeine/nicotine', 'Schedule a cardiologist appointment for long-term management'],
      es: ['Mida la presión arterial de inmediato', 'Reduzca el consumo de sodio', 'Programe una cita con el cardiólogo'],
      hi: ['तुरंत रक्तचाप (ब्लड प्रेशर) मापें', 'नमक का सेवन कम करें और कैफीन से बचें', 'दीर्घकालिक प्रबंधन के लिए कार्डियोलॉजिस्ट से अपॉइंटमेंट लें']
    }
  },
  {
    id: 'dermatitis',
    name: { en: 'Contact Dermatitis', es: 'Dermatitis de contacto', hi: 'डर्मेटाइटिस (त्वचा की सूजन)' },
    symptoms: ['skin_rash', 'itching'],
    severity: 'low',
    specialist: 'Dermatologist',
    possibleCauses: {
      en: ['Allergen contact (soaps, cosmetics, plants)', 'Chemical irritants exposure'],
      es: ['Contacto con alérgenos (jabones, plantas)', 'Exposición a irritantes químicos'],
      hi: ['एलर्जेन संपर्क (साबुन, सौंदर्य प्रसाधन, पौधे)', 'रासायनिक जलन पैदा करने वाले तत्वों का संपर्क']
    },
    nextSteps: {
      en: ['Wash the affected skin thoroughly with cool water', 'Apply hydrocortisone cream or cold aloe vera gel', 'Avoid scratching to prevent secondary skin infections'],
      es: ['Lave la piel afectada con agua fría', 'Aplique crema de hidrocortisona o gel de aloe vera', 'Evite rascarse para prevenir infecciones'],
      hi: ['प्रभावित त्वचा को ठंडे पानी से अच्छी तरह धोएं', 'हाइड्रोकार्टिसोन क्रीम या एलोवेरा जेल लगाएं', 'द्वितीयक संक्रमण से बचने के लिए खुजली करने से बचें']
    }
  },
  {
    id: 'gastroenteritis',
    name: { en: 'Gastroenteritis', es: 'Gastroenteritis', hi: 'गैस्ट्रोएंटेराइटिस (पेट का फ्लू)' },
    symptoms: ['nausea', 'abdominal_pain', 'fatigue', 'fever'],
    severity: 'medium',
    specialist: 'General Physician',
    possibleCauses: {
      en: ['Contaminated food or water intake', 'Viral infection (Rotavirus or Norovirus)', 'Poor hand hygiene'],
      es: ['Consumo de agua o comida contaminada', 'Infección viral (Rotavirus/Norovirus)', 'Poco lavado de manos'],
      hi: ['दूषित भोजन या पानी का सेवन', 'वायरल संक्रमण (रोटावायरस या नोरोवायरस)', 'हाथों की स्वच्छता न रखना']
    },
    nextSteps: {
      en: ['Sip Oral Rehydration Salts (ORS) continuously', 'Eat bland foods (bananas, rice, applesauce)', 'Seek medical help if vomiting persists for more than 24 hours'],
      es: ['Tome Suero de Rehidratación Oral (SRO) a sorbos', 'Coma alimentos blandos (arroz, plátano)', 'Consulte al médico si los vómitos persisten por más de 24 horas'],
      hi: ['ओआरएस (ORS) का घोल घूंट-घूंट कर पीते रहें', 'हल्का भोजन लें (केला, चावल, सेब की प्यूरी)', 'यदि उल्टी 24 घंटे से अधिक समय तक बनी रहे तो डॉक्टर से संपर्क करें']
    }
  },
  {
    id: 'asthma',
    name: { en: 'Pediatric Asthma', es: 'Asma Pediátrica', hi: 'बाल अस्थमा' },
    symptoms: ['cough', 'shortness_of_breath', 'wheezing', 'chest_pain'],
    severity: 'high',
    specialist: 'Pediatrician',
    possibleCauses: {
      en: ['Genetic airway hypersensitivity', 'Allergen triggers (dust mites, pollen, pet dander)', 'Respiratory viral infections'],
      es: ['Hipersensibilidad de vías respiratorias genética', 'Alérgenos desencadenantes', 'Infecciones respiratorias'],
      hi: ['आनुवंशिक वायुमार्ग अतिसंवेदनशीलता', 'एलर्जी ट्रिगर्स (धूल, पराग)', 'श्वसन वायरल संक्रमण']
    },
    nextSteps: {
      en: ['Administer prescribed rescue inhaler (Albuterol) immediately', 'Keep the child sitting upright and calm', 'Call emergency emergency line if breathing does not improve in 10 minutes'],
      es: ['Administre el inhalador de rescate recetado de inmediato', 'Mantenga al niño sentado y tranquilo', 'Llame a emergencias si no mejora en 10 minutos'],
      hi: ['तुरंत निर्धारित बचाव इनहेलर (एल्ब्युटेरॉल) दें', 'बच्चे को सीधा बैठाकर शांत रखें', '10 मिनट में सुधार न होने पर आपातकालीन सहायता बुलाएं']
    }
  }
];

// 3. Medicines Reference List
export const MEDICINES: Medicine[] = [
  {
    name: 'Paracetamol (Acetaminophen)',
    category: 'Analgesic / Antipyretic',
    uses: {
      en: 'Used to treat mild to moderate pain (headache, muscle ache, arthritis, toothache) and reduce fever.',
      es: 'Se usa para tratar dolor leve a moderado (cabeza, muscular, artritis) y reducir la fiebre.',
      hi: 'हल्के से मध्यम दर्द (सिरदर्द, मांसपेशियों में दर्द, दांत दर्द) के इलाज और बुखार को कम करने के लिए उपयोग किया जाता है।'
    },
    sideEffects: {
      en: 'Rare side effects. Can cause serious liver damage if taken in excessive amounts.',
      es: 'Efectos secundarios raros. Puede dañar el hígado en dosis excesivas.',
      hi: 'दुर्लभ दुष्प्रभाव। अत्यधिक मात्रा में लेने पर लीवर को गंभीर नुकसान हो सकता है।'
    },
    precautions: {
      en: 'Avoid drinking alcohol while taking this. Check labels of other medicines to ensure they do not contain paracetamol to avoid overdose.',
      es: 'Evite el alcohol. Revise que otras medicinas no contengan paracetamol para evitar sobredosis.',
      hi: 'इसे लेते समय शराब के सेवन से बचें। ओवरडोज से बचने के लिए सुनिश्चित करें कि अन्य दवाओं में पैरासिटामोल न हो।'
    },
    storage: {
      en: 'Store at room temperature away from direct moisture, heat, and sunlight.',
      es: 'Almacenar a temperatura ambiente lejos de humedad y calor.',
      hi: 'सीधे नमी, गर्मी और धूप से दूर कमरे के तापमान पर स्टोर करें।'
    }
  },
  {
    name: 'Ibuprofen',
    category: 'NSAID (Nonsteroidal Anti-inflammatory Drug)',
    uses: {
      en: 'Relieves inflammatory pain, swelling, fever, and symptoms of arthritis or menstrual cramps.',
      es: 'Alivia dolor inflamatorio, hinchazón, fiebre y calambres menstruales.',
      hi: 'सूजन वाले दर्द, सूजन, बुखार और गठिया या मासिक धर्म के दर्द को दूर करता है।'
    },
    sideEffects: {
      en: 'Stomach irritation, acid reflux, dizziness, mild nausea, and increased blood pressure.',
      es: 'Irritación estomacal, reflujo, mareos y náuseas leves.',
      hi: 'पेट में जलन, एसिड रिफ्लक्स, चक्कर आना, हल्की मतली और रक्तचाप में वृद्धि।'
    },
    precautions: {
      en: 'Always take with food or milk to protect stomach lining. Avoid if you have active stomach ulcers, heart failure, or severe kidney disease.',
      es: 'Tomar con comida. Evitar si tiene úlceras estomacales o enfermedad renal.',
      hi: 'पेट की परत की सुरक्षा के लिए हमेशा भोजन या दूध के साथ लें। यदि पेट में अल्सर या गुर्दे की गंभीर बीमारी हो तो बचें।'
    },
    storage: {
      en: 'Keep in a dry, cool container below 25°C. Out of reach of children.',
      es: 'Mantener seco por debajo de 25°C. Fuera del alcance de niños.',
      hi: '25 डिग्री सेल्सियस से नीचे सूखे, ठंडे कंटेनर में रखें। बच्चों की पहुंच से दूर रखें।'
    }
  },
  {
    name: 'Amoxicillin',
    category: 'Antibiotic (Penicillin class)',
    uses: {
      en: 'Prescribed to treat wide range of bacterial infections (middle ear, strep throat, pneumonia, skin, urinary tract).',
      es: 'Tratamiento de infecciones bacterianas (oídos, garganta, neumonía, piel).',
      hi: 'बैक्टीरियल संक्रमणों (कान, गले में खराश, निमोनिया, त्वचा, मूत्र मार्ग) के इलाज के लिए दिया जाता है।'
    },
    sideEffects: {
      en: 'Nausea, diarrhea, stomach upset, or allergic skin rash.',
      es: 'Náuseas, diarrea, malestar estomacal o erupción cutánea.',
      hi: 'जी मिचलाना, दस्त, पेट खराब होना या त्वचा पर एलर्जी वाले लाल चकत्ते।'
    },
    precautions: {
      en: 'Must complete the full prescribed course. Do not take for viral infections like flu or cold. Check for penicillin allergies first.',
      es: 'Debe completar el tratamiento. No use en infecciones virales. Verifique alergia a penicilina.',
      hi: 'निर्धारित पूरा कोर्स अवश्य समाप्त करें। सर्दी-जुकाम जैसे वायरल संक्रमणों में न लें। पहले पेनिसिलिन एलर्जी की जांच करें।'
    },
    storage: {
      en: 'Keep dry capsules at room temp. If liquid suspension, keep refrigerated and discard after 10-14 days.',
      es: 'Cápsulas secas a temp ambiente. Suspensión líquida en refrigeración.',
      hi: 'सूखे कैप्सूल को सामान्य तापमान पर रखें। यदि तरल सिरप हो, तो फ्रिज में रखें और 10-14 दिनों के बाद फेंक दें।'
    }
  },
  {
    name: 'Cetirizine',
    category: 'Antihistamine (Allergy relief)',
    uses: {
      en: 'Relieves allergy symptoms such as watery eyes, runny nose, sneezing, itching, and hives.',
      es: 'Alivia síntomas de alergias como ojos llorosos, estornudos, picazón y urticaria.',
      hi: 'एलर्जी के लक्षणों जैसे आंखों से पानी आना, बहती नाक, छींकने, खुजली और पित्ती से राहत देता है।'
    },
    sideEffects: {
      en: 'Drowsiness (less than older antihistamines), dry mouth, tiredness, or headache.',
      es: 'Somnolencia, boca seca, cansancio o dolor de cabeza.',
      hi: 'उनींदापन (सुस्ती), मुंह सूखना, थकान या सिरदर्द।'
    },
    precautions: {
      en: 'Be cautious when driving or operating machinery. Avoid consuming alcohol which can amplify drowsiness.',
      es: 'Precaución al conducir. Evite el alcohol ya que aumenta la somnolencia.',
      hi: 'वाहन चलाते समय सावधान रहें। शराब के सेवन से बचें क्योंकि इससे सुस्ती बढ़ सकती है।'
    },
    storage: {
      en: 'Store at room temperature (15°C - 30°C) in a dry drawer.',
      es: 'Almacenar a temperatura ambiente en lugar seco.',
      hi: 'कमरे के तापमान (15°C - 30°C) पर सूखे स्थान पर स्टोर करें।'
    }
  }
];

// 4. Emergency Contacts & Hospitals
export const EMERGENCY_NUMBERS = {
  US: { name: 'Emergency Services', code: '911' },
  IN: { name: 'National Medical Emergency', code: '102 / 108' },
  UK: { name: 'Ambulance Service', code: '999' },
  EU: { name: 'General Emergency', code: '112' }
};

export const HOSPITALS: Hospital[] = [
  {
    id: 'hosp_kakinada_ggh',
    name: 'Government General Hospital (GGH)',
    lat: 16.9835,
    lng: 82.2392,
    phone: '0884 237 3252',
    specialties: ['General Medicine', 'Emergency Services', 'Trauma Care', 'ICU'],
    distance: 0.8,
    directions: {
      en: 'Head South towards Main Road, turn right at Bhanugudi Junction. GGH occupies the main hospital campus on the right.',
      es: 'Vaya al sur hacia la calle principal, gire a la derecha en Bhanugudi Junction.',
      hi: 'मुख्य मार्ग की ओर दक्षिण की ओर जाएं, भानुगुड़ी जंक्शन पर दाएं मुड़ें। GGH दाईं ओर मुख्य अस्पताल परिसर में है।'
    },
    isEmergency: true
  },
  {
    id: 'hosp_apollo_kkd',
    name: 'Apollo Hospital & Clinic',
    lat: 16.9880,
    lng: 82.2415,
    phone: '+91 884 234 4567',
    specialties: ['Cardiology', 'Cardiac Surgery', 'Internal Medicine'],
    distance: 1.5,
    directions: {
      en: 'Located at Port Road, opposite NFCL building. Directly accessible via RTO Office road.',
      es: 'Ubicado en Port Road, frente al edificio NFCL.',
      hi: 'पोर्ट रोड पर स्थित, NFCL बिल्डिंग के सामने। RTO ऑफिस रोड से सीधे पहुंचा जा सकता है।'
    },
    isEmergency: true
  },
  {
    id: 'hosp_trust_kkd',
    name: 'Trust Hospital Kakinada',
    lat: 16.9940,
    lng: 82.2530,
    phone: '+91 884 233 8899',
    specialties: ['Pediatrics', 'Neonatology', 'General Surgery', 'Gynaecology'],
    distance: 2.2,
    directions: {
      en: 'Head East on Ramanayyapeta main road, adjacent to Trust School building.',
      es: 'Diríjase al este por la calle principal Ramanayyapeta.',
      hi: 'रामनय्यपेटा मुख्य मार्ग पर पूर्व की ओर जाएं, ट्रस्ट स्कूल की इमारत के पास।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_sri_ram_kkd',
    name: "Sri Ramachandra Children's Hospital",
    lat: 16.9790,
    lng: 82.2450,
    phone: '+91 884 235 6789',
    specialties: ['Pediatrics', 'Child Vaccinations', 'Neonatal Care'],
    distance: 3.1,
    directions: {
      en: 'Near Subhash Road, behind RTC Complex. Clinic is in the ground floor of Sri Ramachandra chambers.',
      es: 'Cerca de Subhash Road, detrás de RTC Complex.',
      hi: 'सुभाष रोड के पास, RTC कॉम्प्लेक्स के पीछे। क्लिनिक श्री रामचंद्र चैंबर्स के भूतल पर है।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_care_kkd',
    name: 'Care Hospitals Kakinada',
    lat: 16.9920,
    lng: 82.2350,
    phone: '+91 884 232 1122',
    specialties: ['Neurology', 'Neurosurgery', 'ICU', 'Emergency Services'],
    distance: 4.0,
    directions: {
      en: 'Located near Cinema Road junction, next to Venkatrama theater.',
      es: 'Ubicado cerca del cruce de Cinema Road, al lado del teatro Venkatrama.',
      hi: 'सिनेमा रोड जंक्शन के पास स्थित, वेंकटरमण थिएटर के पास।'
    },
    isEmergency: true
  },
  {
    id: 'hosp_sanjeevani_kkd',
    name: 'Sanjeevani Multispeciality Hospital',
    lat: 16.9850,
    lng: 82.2380,
    phone: '+91 884 236 1234',
    specialties: ['General Medicine', 'Orthopedics', 'Urology'],
    distance: 1.1,
    directions: {
      en: 'Located near Bhanugudi Junction, on the Main Road.',
      es: 'Ubicado cerca de Bhanugudi Junction, en la calle principal.',
      hi: 'मुख्य मार्ग पर भानुगुड़ी जंक्शन के पास स्थित है।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_star_kkd',
    name: 'Star Hospital Kakinada',
    lat: 16.9815,
    lng: 82.2410,
    phone: '+91 884 238 9988',
    specialties: ['Emergency Services', 'General Medicine', 'Neurology'],
    distance: 1.4,
    directions: {
      en: 'Jawahar Street, near the old bus stand junction.',
      es: 'Calle Jawahar, cerca del cruce de la antigua parada de autobús.',
      hi: 'जवाहर स्ट्रीट, पुराने बस स्टैंड जंक्शन के पास।'
    },
    isEmergency: true
  },
  {
    id: 'hosp_subra_eye_kkd',
    name: 'Subrahmanyam Eye Hospital',
    lat: 16.9910,
    lng: 82.2340,
    phone: '+91 884 233 4455',
    specialties: ['Ophthalmology', 'Eye Surgery'],
    distance: 1.9,
    directions: {
      en: 'Cinema Road, opposite the municipal park gate.',
      es: 'Cinema Road, frente a la puerta del parque municipal.',
      hi: 'सिनेमा रोड, नगर पालिका पार्क गेट के सामने।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_kiran_eye_kkd',
    name: 'Kiran Eye Hospital',
    lat: 16.9950,
    lng: 82.2420,
    phone: '+91 884 234 5566',
    specialties: ['Ophthalmology', 'Cataract Surgery'],
    distance: 2.6,
    directions: {
      en: 'Santhi Nagar, next to the SBI Bank branch.',
      es: 'Santhi Nagar, al lado de la sucursal del banco SBI.',
      hi: 'शांति नगर, एसबीआई बैंक शाखा के पास।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_akruti_ortho_kkd',
    name: 'Akruti Orthopedic & Surgical Clinic',
    lat: 16.9960,
    lng: 82.2560,
    phone: '+91 884 232 4433',
    specialties: ['Orthopedics', 'Physiotherapy'],
    distance: 2.8,
    directions: {
      en: 'Ramanayyapeta, adjacent to the Apollo pharmacy store.',
      es: 'Ramanayyapeta, al lado de la farmacia Apollo.',
      hi: 'रामनय्यपेटा, अपोलो फार्मेसी स्टोर के बगल में।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_surya_child_kkd',
    name: 'Surya Childrens Hospital',
    lat: 16.9830,
    lng: 82.2395,
    phone: '+91 884 237 8899',
    specialties: ['Pediatrics', 'Neonatal ICU', 'Vaccinations'],
    distance: 0.9,
    directions: {
      en: 'Located opposite GGH Main Gate, above the local medical store.',
      es: 'Ubicado frente a la puerta principal de GGH.',
      hi: 'जीजीएच मेन गेट के सामने स्थित, स्थानीय मेडिकल स्टोर के ऊपर।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_nagarjuna_kkd',
    name: 'Nagarjuna Clinic & Hospital',
    lat: 16.9780,
    lng: 82.2460,
    phone: '+91 884 235 1122',
    specialties: ['General Medicine', 'Diabetology'],
    distance: 3.4,
    directions: {
      en: 'Subhash Road, next to the cooperative bank buildings.',
      es: 'Subhash Road, al lado de los edificios del banco cooperativo.',
      hi: 'सुभाष रोड, सहकारी बैंक भवनों के बगल में।'
    },
    isEmergency: false
  },
  {
    id: 'hosp_padma_skin_kkd',
    name: 'Padma Skin Clinic',
    lat: 16.9870,
    lng: 82.2320,
    phone: '+91 884 236 6699',
    specialties: ['Dermatology', 'Skin Care'],
    distance: 3.6,
    directions: {
      en: 'Temple Street, near Venugopala Swamy temple gateway.',
      es: 'Temple Street, cerca de la puerta del templo Venugopala Swamy.',
      hi: 'टेम्पल स्ट्रीट, वेणुगोपाल स्वामी मंदिर के द्वार के पास।'
    },
    isEmergency: false
  }
];

// 5. Localization Dictionary
export const LOCALIZATION: { [key: string]: { [lang: string]: string } } = {
  home: { en: 'Home', es: 'Inicio', hi: 'होम' },
  aiChat: { en: 'AI Chat', es: 'Chat de IA', hi: 'एआई चैट' },
  symptomChecker: { en: 'Symptom Checker', es: 'Evaluador de Síntomas', hi: 'लक्षण जांच' },
  human3d: { en: '3D Human Engine', es: 'Motor Humano 3D', hi: '3D मानव इंजन' },
  diseasePrediction: { en: 'Disease Prediction', es: 'Predicción de Enfermedades', hi: 'रोग का अनुमान' },
  specialistRecommend: { en: 'Specialist Recommendation', es: 'Especialista Recomendado', hi: 'चिकित्सक की सलाह' },
  hospitals: { en: 'Nearby Hospitals', es: 'Hospitales Cercanos', hi: 'नजदीकी अस्पताल' },
  medicines: { en: 'Medicine Search', es: 'Buscar Medicamentos', hi: 'दवा खोज' },
  history: { en: 'Health History', es: 'Historial Médico', hi: 'स्वास्थ्य इतिहास' },
  emergency: { en: 'Emergency Help', es: 'Ayuda Urgente', hi: 'आपातकालीन सहायता' },
  admin: { en: 'Admin Panel', es: 'Panel Admin', hi: 'एडमिन पैनल' },
  login: { en: 'Sign In / Login', es: 'Iniciar Sesión', hi: 'लॉग इन करें' },
  profile: { en: 'User Profile', es: 'Perfil de Usuario', hi: 'प्रोफाइल' },

  welcomeTitle: { en: 'Welcome to MediGuide AI', es: 'Bienvenido a MediGuide AI', hi: 'MediGuide AI में आपका स्वागत है' },
  welcomeSubtitle: { en: 'Your Personal, Smart Health Companion & Guided Diagnostic Engine.', es: 'Su compañero de salud personal inteligente y motor de diagnóstico guiado.', hi: 'आपका व्यक्तिगत, स्मार्ट स्वास्थ्य साथी और निर्देशित नैदानिक ​​इंजन।' },
  startDiagBtn: { en: 'Start Diagnosis Assessment', es: 'Iniciar Evaluación de Diagnóstico', hi: 'लक्षणों की जांच शुरू करें' },
  quickChatTitle: { en: 'Quick AI Health Assistant', es: 'Asistente de Salud Inteligente Rápido', hi: 'त्वरित एआई स्वास्थ्य सहायक' },
  chatPlaceholder: { en: 'Describe symptoms or ask a health question...', es: 'Describe tus síntomas o haz una pregunta...', hi: 'लक्षण बताएं या स्वास्थ्य से जुड़ा सवाल पूछें...' },
  voiceActive: { en: 'Listening to your voice...', es: 'Escuchando tu voz...', hi: 'आपकी आवाज सुनी जा रही है...' },
  disclaimerText: { en: 'IMPORTANT: MediGuide AI is an educational simulation. It does not replace professional medical advice, diagnosis, or treatment. Always call your local emergency services (911/108/112) in life-threatening scenarios.', es: 'IMPORTANTE: MediGuide AI es una simulación educativa. No reemplaza el consejo médico, diagnóstico o tratamiento profesional.', hi: 'महत्वपूर्ण: MediGuide AI एक शैक्षणिक सिमुलेशन है। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का स्थान नहीं लेता है।' }
};

// --- Storage & Helper Functions ---

// Get active diseases from localStorage or fallback to default
export function getDiseases(): Disease[] {
  const data = localStorage.getItem('mediguide_diseases');
  if (!data) {
    localStorage.setItem('mediguide_diseases', JSON.stringify(DEFAULT_DISEASES));
    return DEFAULT_DISEASES;
  }
  return JSON.parse(data);
}

// Save diseases database to localStorage (used by Admin)
export function saveDiseases(diseases: Disease[]) {
  localStorage.setItem('mediguide_diseases', JSON.stringify(diseases));
}

// Perform disease prediction based on selected symptoms
export function predictDiseases(selectedSymptoms: string[]): { diseaseId: string; confidence: number }[] {
  if (selectedSymptoms.length === 0) return [];
  const diseases = getDiseases();
  
  const results = diseases.map(disease => {
    // Count matches
    const matching = disease.symptoms.filter(sym => selectedSymptoms.includes(sym));
    const confidence = Math.round((matching.length / disease.symptoms.length) * 100);
    return { diseaseId: disease.id, confidence };
  });

  // Filter out diseases with 0 confidence and sort descending
  return results
    .filter(r => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence);
}

// Get saved reports
export function getDiagnosisReports(): DiagnosisReport[] {
  const data = localStorage.getItem('mediguide_reports');
  return data ? JSON.parse(data) : [];
}

// Save a new diagnosis report
export function saveDiagnosisReport(report: Omit<DiagnosisReport, 'id' | 'timestamp'>) {
  const reports = getDiagnosisReports();
  const newReport: DiagnosisReport = {
    ...report,
    id: 'rep_' + Date.now(),
    timestamp: new Date().toLocaleString()
  };
  reports.unshift(newReport);
  localStorage.setItem('mediguide_reports', JSON.stringify(reports));
  return newReport;
}

// Get chat history
export function getChatMessages(): ChatMessage[] {
  const data = localStorage.getItem('mediguide_chat');
  if (!data) {
    const welcomeMsgs: ChatMessage[] = [{
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am your MediGuide AI Assistant. Feel free to describe how you are feeling (e.g. "I have a sharp headache and feel dizzy") or ask any general health questions. Note: I cannot replace a doctor!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
    localStorage.setItem('mediguide_chat', JSON.stringify(welcomeMsgs));
    return welcomeMsgs;
  }
  return JSON.parse(data);
}

// Save chat history
export function saveChatMessages(messages: ChatMessage[]) {
  localStorage.setItem('mediguide_chat', JSON.stringify(messages));
}

// Enhanced Medical NLP Engine & Explanatory AI Assistant
export function getBotResponse(userText: string, _lang: string = 'en'): string {
  const lowerText = userText.trim().toLowerCase();
  
  if (!lowerText) {
    return "Hello! How can I assist you with your health today? You can ask about symptoms, medical conditions, medications, first-aid procedures, or general wellness advice.";
  }

  // --- 1. EMERGENCY RED FLAG CHECKS ---
  if (
    (lowerText.includes('chest pain') || lowerText.includes('heart pain')) &&
    (lowerText.includes('severe') || lowerText.includes('left arm') || lowerText.includes('jaw') || lowerText.includes('sweating') || lowerText.includes('breath'))
  ) {
    return `🚨 **CRITICAL MEDICAL EMERGENCY WARNING**

**Immediate Hazard:** Severe chest pain radiating to the left arm, jaw, neck, or accompanied by acute shortness of breath and cold sweats strongly indicates a **Cardiac Emergency (Heart Attack)**.

### 🚑 Immediate Action Required:
1. **Call Emergency Services Immediately:** Dial **911**, **108**, **112**, or your local emergency number right now.
2. **Rest Immediately:** Sit or lie down in a comfortable position (preferably sitting upright with knees bent). Do not attempt to walk or drive yourself.
3. **Aspirin:** If not allergic and approved by emergency dispatchers, chew one adult aspirin (320mg) slowly.
4. **Loosen Tight Clothing:** Unbutton tight collars and belts to ease breathing.

*Do not delay medical intervention! Professional paramedic response is vital.*`;
  }

  if (
    lowerText.includes('stroke') ||
    (lowerText.includes('numbness') && (lowerText.includes('face') || lowerText.includes('arm') || lowerText.includes('side'))) ||
    lowerText.includes('slurred speech') || lowerText.includes('face drooping')
  ) {
    return `🚨 **CRITICAL STROKE WARNING (F.A.S.T. PROTOCOL)**

**Immediate Hazard:** Sudden facial numbness/drooping, weakness in one arm, or slurred speech are textbook indicators of an acute **Cerebrovascular Accident (Stroke)**.

### 📋 Remember F.A.S.T.:
• **F - Face:** Ask the person to smile. Does one side of the face droop?
• **A - Arms:** Ask the person to raise both arms. Does one arm drift downward?
• **S - Speech:** Ask the person to repeat a simple sentence. Is speech slurred or strange?
• **T - Time:** If you see any of these signs, call emergency services (911/108/112) immediately!

*Time lost is brain lost. Seek emergency hospital care immediately.*`;
  }

  if (lowerText.includes('heavy bleeding') || lowerText.includes('severe cut') || lowerText.includes('arterial blood')) {
    return `🚨 **EMERGENCY FIRST-AID: SEVERE BLEEDING**

### 🚑 Immediate Steps:
1. **Apply Firm Direct Pressure:** Press a clean cloth, towel, or sterile gauze firmly directly over the bleeding site without lifting it to check.
2. **Elevate:** If possible, elevate the injured limb above the level of the heart while maintaining pressure.
3. **Do NOT Remove Soaked Cloths:** Layer new clean cloths directly over saturated ones.
4. **Call Emergency Hotline:** Contact emergency services immediately if bleeding does not stop after 10 minutes of continuous firm pressure.`;
  }

  // --- 2. GREETINGS & GENERAL INTROS ---
  if (lowerText === 'hi' || lowerText === 'hello' || lowerText === 'hey' || lowerText.includes('who are you') || lowerText.includes('what can you do')) {
    return `👋 **Welcome to MediGuide AI Medical Assistant!**

I am your intelligent clinical companion. I can provide detailed explanations for:
• 🩺 **Symptoms & Illnesses** (e.g., "Why do I have a headache?", "What causes acid reflux?")
• 💊 **Medication Information** (e.g., "What is Paracetamol used for?", "Ibuprofen side effects")
• 🚑 **First Aid Procedures** (e.g., "How to treat a burn?", "First aid for sprains")
• 🍏 **General Health & Wellness** (e.g., "How to lower high blood pressure?", "Pediatric fever tips")

*How can I help you today? Feel free to ask any health question!*`;
  }

  // --- 3. MEDICATION EXPLANATIONS ---
  if (lowerText.includes('paracetamol') || lowerText.includes('acetaminophen') || lowerText.includes('crocin') || lowerText.includes('dolo')) {
    return `📌 **MEDICATION EXPLANATION: Paracetamol (Acetaminophen)**

### 🔍 Overview:
Paracetamol (also known as Acetaminophen) is one of the most widely used **Analgesics (pain relievers)** and **Antipyretics (fever reducers)** worldwide.

### 💡 Primary Indications:
• Management of mild to moderate pain (headaches, toothaches, muscle aches, backaches, arthritis pain).
• Reduction of body temperature during fevers (flu, colds, viral infections).

### ⚙️ How It Works:
It acts primarily in the central nervous system by inhibiting prostaglandin synthesis, which elevates the pain threshold and regulates the brain's heat-regulating center (hypothalamus).

### 💊 Usage & Safety Precautions:
• **Adult Dosage:** Standard single dose is 500mg to 1000mg every 4 to 6 hours. Max daily limit is **4000mg (4g) per 24 hours**.
• **Pediatric Dosage:** Must be calculated carefully based on child weight (typically 10-15mg/kg).
• **Liver Caution:** Avoid alcohol consumption. Do not take multiple products containing paracetamol simultaneously to avoid accidental liver toxicity.

### ⚠️ Possible Side Effects:
Generally safe when taken at recommended doses. Excessive dosage can lead to severe **liver damage (hepatotoxicity)**.

### 👨‍⚕️ Recommendation:
Consult a physician or pharmacist if pain persists beyond 5 days or fever lasts more than 3 days.`;
  }

  if (lowerText.includes('ibuprofen') || lowerText.includes('advil') || lowerText.includes('motrin') || lowerText.includes('brufen')) {
    return `📌 **MEDICATION EXPLANATION: Ibuprofen**

### 🔍 Overview:
Ibuprofen belongs to the class of **Non-Steroidal Anti-Inflammatory Drugs (NSAIDs)**. Unlike paracetamol, ibuprofen explicitly reduces tissue inflammation and swelling alongside relieving pain and fever.

### 💡 Primary Indications:
• Inflammatory conditions (arthritis, joint swelling, tendonitis, sprains).
• Menstrual cramps, dental pain, headache, and post-procedural swelling.
• Fever reduction when anti-inflammatory action is required.

### ⚙️ How It Works:
Inhibits COX-1 and COX-2 enzymes, thereby blocking the production of inflammatory prostaglandins throughout the body.

### 💊 Usage & Safety Precautions:
• **Take With Food:** Always take ibuprofen with food, milk, or after meals to protect your stomach lining.
• **Avoid in Stomach Ulcers:** Patients with a history of stomach ulcers, severe heart failure, or kidney disease should consult a doctor before use.
• **Hydration:** Maintain good fluid intake while on NSAIDs.

### ⚠️ Possible Side Effects:
Stomach upset, heartburn, nausea, abdominal discomfort. Prolonged high-dose use increases gastric bleeding risk.

### 👨‍⚕️ Recommendation:
Use the lowest effective dose for the shortest duration necessary. Consult a General Physician for chronic pain management.`;
  }

  if (lowerText.includes('amoxicillin') || lowerText.includes('antibiotic') || lowerText.includes('azithromycin')) {
    return `📌 **MEDICATION EXPLANATION: Amoxicillin & Antibiotics**

### 🔍 Overview:
Amoxicillin is a broad-spectrum **Penicillin-class Antibiotic** used exclusively to treat bacterial infections.

### 💡 Important Clinical Guidance:
• **Bacterial Infections Only:** Antibiotics treat bacterial infections (such as bacterial pneumonia, strep throat, ear infections, UTIs). They have **ZERO effect on viral infections** like colds, flu, or COVID-19.
• **Complete the Full Course:** Always finish the entire prescribed antibiotic course, even if you feel completely recovered. Stopping early promotes dangerous **antibiotic resistance**.

### ⚠️ Precautions & Side Effects:
• Inform your doctor immediately if you have a known penicillin allergy.
• Common side effects include mild stomach upset, loose stools, or mild rash.
• Seek emergency help if you experience hives, swelling of lips/throat, or breathing difficulty (anaphylaxis).

### 👨‍⚕️ Prescription Requirement:
Antibiotics must strictly be prescribed by a certified medical provider after clinical assessment.`;
  }

  if (lowerText.includes('cetirizine') || lowerText.includes('antihistamine') || lowerText.includes('allegra') || lowerText.includes('allergy medicine')) {
    return `📌 **MEDICATION EXPLANATION: Cetirizine (Antihistamines)**

### 🔍 Overview:
Cetirizine is a second-generation **Antihistamine** prescribed for relief from seasonal allergies, allergic rhinitis, and skin hives (urticaria).

### 💡 Primary Indications:
• Relief of sneezing, runny nose, itchy watery eyes, and nasal itching.
• Treatment of allergic skin rashes, insect bite reactions, and hives.

### ⚙️ How It Works:
Selectively blocks peripheral H1 histamine receptors, preventing histamine from triggering allergic reactions in the nose, eyes, and skin.

### 💊 Precautions:
• May cause mild drowsiness in some individuals. Avoid operating heavy machinery if affected.
• Avoid combining with alcohol or sedative medications.`;
  }

  if (lowerText.includes('omeprazole') || lowerText.includes('pantoprazole') || lowerText.includes('antacid') || lowerText.includes('acidity medicine')) {
    return `📌 **MEDICATION EXPLANATION: Omeprazole & Proton Pump Inhibitors (PPIs)**

### 🔍 Overview:
Omeprazole and Pantoprazole are **Proton Pump Inhibitors (PPIs)** designed to decrease the amount of acid produced in the stomach.

### 💡 Primary Indications:
• GERD (Gastroesophageal Reflux Disease), acid heartburn, and stomach ulcers.
• Protection of the stomach lining when taking chronic anti-inflammatory pain medications.

### ⚙️ How It Works:
Shuts down stomach acid pumps (H+/K+ ATPase enzyme system) directly in gastric parietal cells.

### 💊 Best Administration Practice:
• Take **30 to 60 minutes before the first meal of the day** (usually before breakfast) with a full glass of water for maximum efficacy.`;
  }

  // --- 4. SPECIFIC DISEASE & CONDITION EXPLANATIONS ---
  if (lowerText.includes('headache') || lowerText.includes('migraine')) {
    return `📌 **CLEAR EXPLANATION: Headaches & Migraines**

### 🔍 Overview:
Headaches range from common tension-type discomfort to intense, throbbing **Migraines**. Understanding the type helps select the right management strategy.

### 🔍 Key Types & Causes:
1. **Tension Headaches:** Caused by muscle tightness in the head/neck, stress, fatigue, eye strain, or dehydration. Feels like a tight band around the head.
2. **Migraine Headaches:** A neurological condition causing moderate-to-severe throbbing pain (often on one side), sensitivity to light/sound, and nausea. Triggers include stress, sleep changes, hormonal shifts, and specific foods.

### 💡 Step-by-Step Self-Care & Relief:
• **Hydrate:** Drink 2 to 3 glasses of room-temperature water immediately (dehydration is a primary trigger).
• **Rest in Dark Room:** Lie down in a quiet, dark, well-ventilated space with eyes closed.
• **Cold / Warm Compress:** Apply a cool damp towel or ice pack to your forehead or back of the neck.
• **Magnesium & Rest:** Ensure adequate rest and avoid looking at bright phone/computer screens.

### 🚩 When to See a Doctor (Red Flags):
• Sudden "thunderclap" headache (worst headache of your life).
• Headache accompanied by high fever, stiff neck, confusion, or vision loss.

### 👨‍⚕️ Recommended Specialist:
**Neurologist** or **General Physician**.`;
  }

  if (lowerText.includes('hypertension') || lowerText.includes('high blood pressure') || lowerText.includes('high bp')) {
    return `📌 **CLEAR EXPLANATION: Hypertension (High Blood Pressure)**

### 🔍 Overview:
Hypertension occurs when the long-term force of blood pushing against your artery walls is consistently too high (typically 130/80 mmHg or higher). Often called a "silent killer" because it may cause no obvious early symptoms.

### 🔍 Common Causes & Risk Factors:
• High sodium (salt) dietary intake.
• Lack of physical activity & chronic mental stress.
• Genetic family history & advancing age.
• Excessive alcohol consumption or tobacco smoking.

### 💡 Actionable Management Steps:
1. **DASH Diet Principles:** Increase intake of potassium-rich foods (bananas, spinach) and cut processed foods and salt intake below 2,300mg/day.
2. **Regular Aerobic Exercise:** 30 minutes of daily moderate walking or swimming.
3. **Stress Reduction:** Deep breathing exercises, meditation, and structured 7-8 hours sleep.
4. **Blood Pressure Monitoring:** Keep a daily BP log at home using a digital cuff.

### 🚩 Red Flag Indicators:
• BP higher than 180/120 mmHg accompanied by severe headache, chest pressure, or blurred vision requires **Emergency ER Evaluation**.

### 👨‍⚕️ Recommended Specialist:
**Cardiologist** or **General Physician**.`;
  }

  if (lowerText.includes('diabetes') || lowerText.includes('blood sugar') || lowerText.includes('high sugar')) {
    return `📌 **CLEAR EXPLANATION: Diabetes Mellitus**

### 🔍 Overview:
Diabetes is a chronic metabolic condition where the body either does not produce enough insulin (Type 1) or cannot effectively use the insulin it produces (Type 2), leading to elevated blood glucose levels.

### 📋 Key Symptoms to Recognize:
• Increased thirst (polydipsia) & frequent urination (polyuria).
• Unexplained weight loss, persistent fatigue, and blurred vision.
• Slow-healing cuts or frequent infections.

### 💡 Lifestyle & Daily Management:
• **Complex Carbs & Fiber:** Focus on whole grains, vegetables, and legumes while avoiding refined sugars and sugary drinks.
• **Routine Physical Exercise:** Muscle activity helps transfer glucose from blood to cells independently of insulin.
• **Regular HbA1c Checks:** Monitor long-term blood sugar levels every 3 to 6 months.

### 👨‍⚕️ Recommended Specialist:
**Endocrinologist** or **Diabetologist**.`;
  }

  if (lowerText.includes('asthma') || lowerText.includes('wheezing') || lowerText.includes('shortness of breath')) {
    return `📌 **CLEAR EXPLANATION: Asthma & Airway Hypersensitivity**

### 🔍 Overview:
Asthma is a chronic respiratory condition characterized by inflammation and narrowing of the bronchial airways, leading to excess mucus production and difficulty breathing.

### 🔍 Triggers & Causes:
• Environmental allergens (pollen, dust mites, pet dander, mold).
• Cold air, exercise, chemical fumes, or viral chest infections.

### 💡 Step-by-Step Self-Care & Management:
• **Use Prescribed Inhaler:** Use rescue inhalers (e.g., Albuterol/Salbutamol) immediately during an attack.
• **Sit Upright:** Keep the person sitting upright; do not lie down flat during breathing difficulty.
• **Identify & Avoid Triggers:** Use air purifiers and keep indoor environments dust-free.

### 🚩 Emergency Warning:
If chest tightness does not improve after using a rescue inhaler, or if lips turn blue/gray, call **Emergency Services** immediately.

### 👨‍⚕️ Recommended Specialist:
**Pulmonologist** (Chest Specialist).`;
  }

  if (lowerText.includes('acid reflux') || lowerText.includes('gerd') || lowerText.includes('heartburn') || lowerText.includes('gastritis') || lowerText.includes('acidity')) {
    return `📌 **CLEAR EXPLANATION: Acid Reflux & GERD (Heartburn)**

### 🔍 Overview:
Acid reflux occurs when stomach acid flows back up into the esophagus (the tube connecting mouth and stomach). This regurgitation irritates the lining of the esophagus, causing a painful burning sensation in the chest.

### 🔍 Common Triggers:
• Spicy, oily, fried, or highly acidic foods (citrus, tomato sauce).
• Lying down immediately after eating heavy meals.
• Caffeine, chocolate, carbonated sodas, and smoking.

### 💡 Actionable Relief Steps:
1. **Elevate Head of Bed:** Use extra pillows or elevate the head of your mattress by 6 inches.
2. **Avoid Late Night Eating:** Stop eating at least 3 hours before going to sleep.
3. **Small Meals:** Eat smaller, more frequent meals rather than large heavy dinners.
4. **Sip Warm Water or Chamomile Tea:** Helps neutralize acid temporarily.

### 👨‍⚕️ Recommended Specialist:
**Gastroenterologist**.`;
  }

  if (lowerText.includes('fever') && (lowerText.includes('child') || lowerText.includes('kid') || lowerText.includes('baby'))) {
    return `📌 **PEDIATRIC CARE EXPLANATION: Fever in Children**

### 🔍 Overview:
Fever is the body's natural immune response to fight off infections. In most children, viral infections (colds, flu) are the primary cause.

### 💡 Practical Step-by-Step Care:
• **Hydration is Key:** Offer frequent small sips of water, oral rehydration solution (ORS), clear soups, or milk.
• **Light Clothing:** Dress the child in lightweight cotton clothing and use a light sheet. Do not bundle them in heavy blankets.
• **Lukewarm Sponge Bath:** Sponge the child with lukewarm water (NEVER cold water or rubbing alcohol).

### 🛑 CRITICAL SAFETY WARNING:
• **NEVER give Aspirin to children or teenagers** due to the risk of **Reye’s Syndrome** (a rare but fatal liver/brain condition).
• Always use age and weight-appropriate pediatric paracetamol or ibuprofen as recommended by a pediatrician.

### 🚩 Seek Immediate Medical Care If:
• Infant under 3 months old has a temperature of 100.4°F (38°C) or higher.
• Child is lethargic, unresponsive, or has difficulty breathing.`;
  }

  // --- 5. FIRST AID PROCEDURES ---
  if (lowerText.includes('burn') || lowerText.includes('scalding water') || lowerText.includes('fire')) {
    return `📌 **FIRST-AID PROCEDURES: Burns & Scalds**

### 🚑 Immediate First-Aid Steps:
1. **Cool Under Water:** Immediately place the burned area under **cool running tap water for 10 to 20 minutes**.
2. **Remove Jewelry:** Gently remove rings or tight clothing around the burn before swelling begins.
3. **Cover Loosely:** Cover the burn loosely with a clean, non-stick sterile bandage or clean cling film.

### 🛑 What NOT to Do:
• Do **NOT** apply ice directly (causes tissue damage).
• Do **NOT** apply butter, toothpaste, oil, or home ointments.
• Do **NOT** break any blisters that form.

### 🚩 Seek Emergency Hospital Care If:
• Burn covers a large body area, face, hands, feet, or genitals.
• Burn appears charred white, dark brown, or leathery (3rd-degree burn).`;
  }

  if (lowerText.includes('sprain') || lowerText.includes('twist ankle') || lowerText.includes('wrist injury')) {
    return `📌 **FIRST-AID PROCEDURES: Sprains & Strains (R.I.C.E. Protocol)**

### 💡 Follow R.I.C.E. Protocol:
1. **R - Rest:** Stop physical activity immediately and protect the injured joint.
2. **I - Ice:** Apply cold ice packs wrapped in a towel for 15-20 minutes every 2-3 hours for the first 48 hours.
3. **C - Compression:** Wrap the joint gently with an elastic crepe bandage to reduce swelling (do not wrap too tightly).
4. **E - Elevation:** Prop up the injured limb on pillows above heart level to drain excess fluid.

### 👨‍⚕️ Consult an Orthopedist if:
You cannot bear weight on the limb or if there is severe visible bone deformity (possible fracture).`;
  }

  // --- 6. SYMPTOM MATCHING HEURISTIC WITH ENHANCED EXPLANATIONS ---
  const matchingSymptoms: string[] = [];
  SYMPTOMS.forEach(s => {
    Object.values(s.name).forEach(nameVal => {
      if (lowerText.includes(nameVal.toLowerCase())) {
        if (!matchingSymptoms.includes(s.id)) {
          matchingSymptoms.push(s.id);
        }
      }
    });
  });

  if (matchingSymptoms.length > 0) {
    const predictions = predictDiseases(matchingSymptoms);
    const matchedNames = matchingSymptoms.map(sid => SYMPTOMS.find(s => s.id === sid)?.name.en).filter(Boolean);

    if (predictions.length > 0) {
      const topPred = getDiseases().find(d => d.id === predictions[0].diseaseId);
      if (topPred) {
        const causes = topPred.possibleCauses.en?.join(', ') || 'Various environmental or infectious factors';
        const steps = topPred.nextSteps.en?.map(s => `• ${s}`).join('\n') || '• Rest and drink plenty of fluids';

        return `📌 **CLINICAL SYMPTOM EVALUATION REPORT**

### 🔍 Identified Symptoms:
You mentioned: **${matchedNames.join(', ')}**.

### 📋 Primary Medical Estimation:
Based on algorithmic symptom mapping, these symptoms closely correspond to **${topPred.name.en}** (Confidence Score: **${predictions[0].confidence}%**).

### 🔍 Possible Causes & Triggers:
${causes}.

### 💡 Recommended Step-by-Step Next Steps:
${steps}

### 👨‍⚕️ Specialist Consultation:
We recommend consulting a **${topPred.specialist}**.

*Want a complete, multi-step assessment? Click our **Symptom Checker** button to generate a detailed downloadable clinical report.*`;
      }
    }
  }

  // --- 7. INTELLIGENT DYNAMIC FALLBACK EXPLANATION GENERATOR ---
  // If the query does not match an exact pattern above, extract key terms and provide a structured, clear explanation.
  const queryWords = lowerText.replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(w => w.length > 3);
  const keyTopic = queryWords.slice(0, 3).join(' ') || 'your health query';

  return `📌 **CLEAR EXPLANATION & GUIDANCE FOR: "${userText.trim()}"**

### 🔍 Overview & Context:
Regarding **${keyTopic}**, health questions of this nature typically relate to physical wellness, lifestyle habits, or early physiological body signals.

### 💡 General Recommended Guidance & Self-Care:
1. **Hydration & Fluids:** Ensure adequate daily water intake (2 to 3 liters/day) to maintain optimal cellular function and circulatory balance.
2. **Rest & Recovery:** Prioritize 7-8 hours of uninterrupted nocturnal sleep to allow tissue restoration and immune system stabilization.
3. **Monitor Symptoms:** Note the onset, duration, intensity (1-10 scale), and any specific triggering or relieving factors.
4. **Nutrition & Balance:** Consume fresh, nutrient-dense whole foods while minimizing processed sugars and chemical additives.

### 🚩 When to Consult a Healthcare Provider:
• If discomfort persists for more than 48-72 hours without improvement.
• If symptoms interfere with sleep, mobility, or daily functioning.
• If accompanied by high fever, severe pain, or unexplained weight loss.

### 👨‍⚕️ Next Steps in MediGuide AI:
• **Symptom Checker:** Use our step-by-step diagnostic tool in the navigation bar for a structured report.
• **Nearby Hospitals:** Locate nearby clinics and specialists if you need an in-person appointment.

*Disclaimer: MediGuide AI provides automated informational guidance and does not replace certified clinical care.*`;
}


// --- Admin Profile Model and Persistence ---
export interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  bio: string;
  accentColor: string; // hex color code matching the choices
  mfaEnabled: boolean;
  autoLockEnabled: boolean;
  tokenVerificationEnabled: boolean;
  auditTrailEnabled: boolean;
}

const DEFAULT_ADMIN_PROFILE: AdminProfile = {
  name: 'John Doe',
  email: 'john.doe@mediguide.ai',
  phone: '+1 (555) 019-2834',
  role: 'System Administrator',
  department: 'Information Technology & Security',
  bio: 'Lead systems architect and medical data security officer for MediGuide AI platform operations.',
  accentColor: '#0f766e',
  mfaEnabled: true,
  autoLockEnabled: false,
  tokenVerificationEnabled: true,
  auditTrailEnabled: true
};

export function getAdminProfile(): AdminProfile {
  const data = localStorage.getItem('mediguide_admin_profile');
  if (!data) {
    localStorage.setItem('mediguide_admin_profile', JSON.stringify(DEFAULT_ADMIN_PROFILE));
    return DEFAULT_ADMIN_PROFILE;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_ADMIN_PROFILE;
  }
}

export function saveAdminProfile(profile: AdminProfile) {
  localStorage.setItem('mediguide_admin_profile', JSON.stringify(profile));
}

