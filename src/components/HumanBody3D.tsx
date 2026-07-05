import HologramHuman3D from './HologramHuman3D';

interface HumanBody3DProps {
  onSelectOrgan?: (organName: string) => void;
}

export default function HumanBody3D({ onSelectOrgan }: HumanBody3DProps) {
  return (
    <HologramHuman3D onSelectOrgan={onSelectOrgan} />
  );
}
