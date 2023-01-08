export default function PageHeading({ title, icon, color }) {
  return (
    <div className="relative py-10 border-b mt-3 mb-10">
      <div
        className={`absolute ${color} shadow top-1/2 lg:-left-4 lg:-translate-x-full -translate-y-1/2 w-16 h-16 rounded-full grid place-items-center text-4xl`}
      >
        <span className={icon}></span>
      </div>
      <h2 className="font-semibold ml-20 lg:ml-0 text-gray-600">{title}</h2>
    </div>
  );
}
