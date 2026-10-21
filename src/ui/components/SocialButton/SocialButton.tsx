import socialIcon from '@/ui/assets/social-placeholder.svg';
import { Button } from '../Button/Button';

type SocialButtonProps = {
  provider: string;
  onClick: () => void;
  icon?: string;
};

/** Botón de proveedor externo. El icono es el marcador de posición del diseño (research.md R11). */
export function SocialButton({ provider, onClick, icon = socialIcon }: SocialButtonProps) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <img src={icon} alt="" width={20} height={20} />
      {provider}
    </Button>
  );
}
