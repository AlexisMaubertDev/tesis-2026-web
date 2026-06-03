import Modal from "@mui/material/Modal";
import CallToActionButton from "./CallToActionButton";

type Props = {
  open: boolean;
  title: string;
  subtitle: string;
  disabled: boolean;
  setOpen: (open: boolean) => void;
  confirm: () => void;
  cancel: () => void;
};

export default function ChoiceModal({
  open,
  setOpen,
  title,
  subtitle,
  confirm,
  disabled,
  cancel,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      sx={{ padding: 4 }}
    >
      <div className="absolute top-1/2 md:top-1/3 left-1/2  max-w-4/5 md:max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-cerulean-100 p-12 shadow-lg font-sans">
        <h2 className="text-center text-xl font-bold mb-2">{title}</h2>
        <p className="text-center text-gray-600 mb-4">{subtitle}</p>
        <div className="flex justify-center gap-2 pt-6">
          <CallToActionButton
            type="button"
            disabled={disabled}
            handleSubmit={() => cancel()}
          >
            Cancelar
          </CallToActionButton>
          <CallToActionButton
            type="button"
            disabled={disabled}
            handleSubmit={() => confirm()}
          >
            Confirmar
          </CallToActionButton>
        </div>
      </div>
    </Modal>
  );
}
