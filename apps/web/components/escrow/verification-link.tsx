type VerificationLinkProps = {
  label: string;
  value: string;
  href?: string;
};

export function VerificationLink({ label, value, href }: VerificationLinkProps) {
  return (
    <p className="mt-2 break-all text-xs font-semibold text-emerald-900">
      {label}:{" "}
      {href ? (
        <a className="underline decoration-emerald-600 underline-offset-2" href={href} target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        value
      )}
    </p>
  );
}
