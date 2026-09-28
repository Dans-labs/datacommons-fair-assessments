import { Button as BaseButton } from "@base-ui/react/button";

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  nativeButton?: boolean; // if true, render the button as a native button element instead of the default BaseButton
  render?: React.ReactElement;
  variant?: "outline" | "solid";
}

export function Button({ children, className, render, variant, ...rest }: ButtonProps) {
  return (
    <BaseButton
      {...rest}
      render={render}
      nativeButton={!render}
      className={`
        px-3 md:px-4 
        py-2 
        rounded-lg
        ${
          variant === "outline"
            ? "bg-transparent border-2 border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white"
            : "bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white"
        }
        transition-colors
        duration-300
        font-bold
        cursor-pointer
        disabled:bg-gray-400 
        disabled:cursor-not-allowed 
        disabled:hover:bg-gray-400
        ${className}
      `}
    >
      {children}
    </BaseButton>
  );
}
