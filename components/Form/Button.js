export default function Button({ children, className, ...props }) {
  return (
    <button
      className={`${className} w-2/3 transition-all text-sm bg-primary py-2 px-4 rounded-md text-white hover:bg-opacity-80 shadow-sm shadow-primary `}
      {...props}
    >
      {children}
    </button>
  );
}
