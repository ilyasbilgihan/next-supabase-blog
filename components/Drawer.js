import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export default function Drawer({ open, setOpen, title, content }) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-[80vw] md:w-[70vw] lg:w-[61vw]">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div>
                      <button
                        type="button"
                        className="outline-none cursor-pointer absolute top-0 left-0 px-[3px] my-2 transition-colors -ml-2 -translate-x-full text-gray-300 hover:text-white text-3xl isax-close-circle"
                        onClick={() => setOpen(false)}
                      ></button>
                    </div>
                  </Transition.Child>
                  <div className="flex h-full flex-col bg-white shadow-xl pl-6">
                    <div className="py-6">
                      <Dialog.Title className="text-lg font-bold text-gray-700">
                        {title}
                      </Dialog.Title>
                    </div>

                    <div className="overflow-y-auto pr-6 pb-6 relative flex-1">{content}</div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
