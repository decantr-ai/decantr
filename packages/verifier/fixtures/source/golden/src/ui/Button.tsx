export interface ButtonProps {
  label: string;
}

export function Button(props: ButtonProps) {
  return (
    <button type="button" className="d-button">
      {props.label}
    </button>
  );
}
