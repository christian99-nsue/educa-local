interface RegisterStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, label: "Información del centro" },
  { number: 2, label: "Administrador" },
  { number: 3, label: "Estructura académica" },
  { number: 4, label: "Configuración" },
  { number: 5, label: "Confirmación" },
];

const RegisterSteps = ({ currentStep }: RegisterStepsProps) => {
  return (
    <div className="reg">
      <h3>Registro de centro</h3>
      {steps.map((step) => {
        const isCompleted = step.number < currentStep;
        const isActive = step.number === currentStep;

        let numberClass = `num-${step.number}`;
        let labelClass = `num-${step.number}-${step.number}`;

        if (isCompleted) {
          numberClass += " num-completed";
        } else if (isActive) {
          numberClass += " num-active";
          labelClass += " label-active";
        }

        return (
          <span key={step.number}>
            <small className={numberClass}>
              {isCompleted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="check-icon"
                >
                  <path
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.number
              )}
            </small>
            <small className={labelClass}>{step.label}</small>
          </span>
        );
      })}
    </div>
  );
};

export default RegisterSteps;
