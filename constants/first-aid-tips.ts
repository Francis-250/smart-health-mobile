export type FirstAidTip = {
  id: string;
  title: string;
  category: string;
  emergencyLevel: "Low" | "Medium" | "High" | "Emergency";
  description: string;
  steps: string[];
  warnings: string[];
  keywords: string[];
};

export const FIRST_AID_TIPS: FirstAidTip[] = [
  {
    id: "severe-bleeding",
    title: "Severe Bleeding",
    category: "Bleeding",
    emergencyLevel: "Emergency",
    description: "Control heavy external bleeding while emergency help is coming.",
    steps: [
      "Call emergency services or ask another person to call.",
      "Apply firm, continuous pressure with clean cloth or gauze.",
      "Add more cloth on top if blood soaks through; do not remove the first layer.",
      "Keep the person warm and still until professional help arrives.",
    ],
    warnings: [
      "Do not press directly on an embedded object.",
      "Do not use a tourniquet unless trained or instructed by emergency services.",
    ],
    keywords: ["blood", "cut", "wound", "hemorrhage"],
  },
  {
    id: "burns",
    title: "Burn First Aid",
    category: "Burns",
    emergencyLevel: "High",
    description: "Immediate care for heat burns while assessing severity.",
    steps: [
      "Move away from the heat source and remove nearby jewelry or tight clothing.",
      "Cool the burn under cool running water for 20 minutes.",
      "Cover loosely with sterile non-stick dressing or clean plastic wrap.",
      "Seek urgent care for deep, large, electrical, chemical, facial, hand, or genital burns.",
    ],
    warnings: [
      "Do not use ice, butter, toothpaste, or creams.",
      "Do not break blisters or remove clothing stuck to skin.",
    ],
    keywords: ["fire", "hot", "scald", "blister"],
  },
  {
    id: "adult-cpr",
    title: "Adult CPR",
    category: "CPR",
    emergencyLevel: "Emergency",
    description: "For an unresponsive adult who is not breathing normally.",
    steps: [
      "Call emergency services and put the phone on speaker.",
      "Place the heel of one hand in the center of the chest and the other on top.",
      "Give hard, fast compressions at 100–120 per minute.",
      "Use an AED as soon as available and follow its prompts.",
    ],
    warnings: [
      "Start compressions immediately if the person is unresponsive and not breathing normally.",
      "Continue until help takes over or the person shows signs of life.",
    ],
    keywords: ["heart", "not breathing", "unconscious", "cardiac"],
  },
  {
    id: "adult-choking",
    title: "Adult Choking",
    category: "Choking",
    emergencyLevel: "Emergency",
    description: "Help an adult who cannot cough, speak, or breathe.",
    steps: [
      "Ask if they are choking and call emergency services.",
      "Give up to five firm back blows between the shoulder blades.",
      "Give up to five abdominal thrusts if the blockage remains.",
      "Repeat and begin CPR if the person becomes unresponsive.",
    ],
    warnings: [
      "Do not perform blind finger sweeps.",
      "Use chest thrusts instead for pregnancy or when abdominal thrusts are not possible.",
    ],
    keywords: ["airway", "food", "cannot speak", "cannot breathe"],
  },
  {
    id: "suspected-fracture",
    title: "Suspected Fracture",
    category: "Fractures",
    emergencyLevel: "High",
    description: "Protect an injured limb and prevent further damage.",
    steps: [
      "Keep the injured area still and support it in the position found.",
      "Apply a wrapped cold pack around—not directly on—the injury.",
      "Cover open wounds with a clean dressing without pushing bone back.",
      "Arrange urgent medical assessment.",
    ],
    warnings: [
      "Do not straighten or test the injured limb.",
      "Call emergency services for neck, back, hip, open, or severely deformed injuries.",
    ],
    keywords: ["broken bone", "fall", "swelling", "deformity"],
  },
  {
    id: "stroke",
    title: "Stroke Emergency",
    category: "Neurological",
    emergencyLevel: "Emergency",
    description: "Use FAST and get emergency care immediately.",
    steps: [
      "Face: ask the person to smile and look for one-sided drooping.",
      "Arms: ask them to raise both arms and look for weakness.",
      "Speech: listen for slurred or unusual speech.",
      "Time: call emergency services immediately and note when symptoms began.",
    ],
    warnings: [
      "Do not give food, drink, or medication.",
      "Symptoms that disappear still require emergency assessment.",
    ],
    keywords: ["face droop", "weakness", "speech", "brain"],
  },
  {
    id: "seizure",
    title: "Seizure",
    category: "Neurological",
    emergencyLevel: "High",
    description: "Keep the person safe during a seizure.",
    steps: [
      "Move dangerous objects away and cushion the head.",
      "Time the seizure and loosen tight clothing around the neck.",
      "After shaking stops, place them on their side if breathing normally.",
      "Stay until they recover and explain what happened.",
    ],
    warnings: [
      "Do not restrain them or put anything in their mouth.",
      "Call emergency services if it lasts over five minutes, repeats, or breathing is difficult.",
    ],
    keywords: ["convulsion", "shaking", "epilepsy"],
  },
  {
    id: "poisoning",
    title: "Suspected Poisoning",
    category: "Poisoning",
    emergencyLevel: "High",
    description: "Reduce exposure and get expert instructions quickly.",
    steps: [
      "Move away from the substance without exposing yourself.",
      "Call emergency services or your poison-control service.",
      "Keep the container or product information for responders.",
      "Follow professional instructions exactly.",
    ],
    warnings: [
      "Do not induce vomiting unless a professional instructs you.",
      "Do not give food, drink, or home remedies.",
    ],
    keywords: ["chemical", "overdose", "swallowed", "toxic"],
  },
];
