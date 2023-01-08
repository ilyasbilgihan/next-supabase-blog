import { Menu } from '@headlessui/react';

export function DropdownItem({ children, handler, icon, withDivider, color, ...props }) {
  const twColor =
    color === 'danger'
      ? 'text-red-500 hover:bg-red-500'
      : 'text-gray-700 hover:text-primary hover:bg-primary';
  return (
    <>
      {withDivider && <li className="border-t border-gray-200 my-1.5" />}
      <Menu.Item
        as="li"
        onClick={() => {
          handler(children);
        }}
      >
        <div
          className={`cursor-pointer hover:bg-opacity-20 flex rounded-md items-center w-full px-3 py-1.5 text-sm gap-3
          ${twColor}`}
        >
          {icon}
          <span>{children}</span>
        </div>
      </Menu.Item>
    </>
  );
}
