import { Menu, Transition } from '@headlessui/react';
import { DropdownItem } from './DropdownItem';
import React from 'react';

export default function Dropdown({ items, children, handler, className }) {
  return (
    <>
      <Menu as="div" className="relative flex items-center justify-center">
        <Menu.Button>{children}</Menu.Button>
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-250"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-250"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={`absolute border top-9 right-0 mt-6 w-52 bg-white rounded-[14px] shadow-lg outline-none ${className}`}
          >
            <ul className="p-2">
              {items.map((item) => (
                <DropdownItem
                  key={item.name}
                  withDivider={item.withDivider}
                  color={item?.color || 'primary'}
                  icon={item.icon}
                  handler={handler}
                >
                  {item.name}
                </DropdownItem>
              ))}
            </ul>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
