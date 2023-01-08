import slugify from '@/utils/slugify';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useFormikContext } from 'formik';

export default function InputTag({ fieldProps, label, limit }) {
  const [parent, enableAnimations] = useAutoAnimate(/* optional config */);
  const { setFieldValue } = useFormikContext();

  const handleChange = (e) => {
    if (fieldProps.field.value.length == limit) {
      e.preventDefault();
    } else {
      // add tag if user has key down => Enter, Tab, or comma(,)
      if ([188, 13].includes(e.keyCode)) {
        e.preventDefault();
        const slug = slugify(e.target.value);

        // do not add if exists
        if (fieldProps.field.value.some((el) => el.slug == slug) || e.target.value.trim() == '') {
          return;
        }
        setFieldValue(fieldProps.field.name, [
          ...fieldProps.field.value,
          { name: e.target.value.trim(), slug },
        ]);

        // reset input box
        e.target.value = '';
      }
    }

    // Delete last tag
    if (e.keyCode == 8 && !e.target.value) {
      setFieldValue(fieldProps.field.name, [...fieldProps.field.value].slice(0, -1));
    }
  };

  const handleDelete = (target) => {
    setFieldValue(
      fieldProps.field.name,
      fieldProps.field.value.filter((tag) => target !== tag.slug),
    );
  };

  return (
    <div
      ref={parent}
      style={{ transition: '.3s border-color' }}
      className={`${
        fieldProps.meta.error
          ? fieldProps.meta.touched
            ? '!border-red-500'
            : ''
          : fieldProps.field.value.length > 0
          ? '!border-teal-600'
          : ''
      } sm:flex sm:mt-0 rounded-lg sm:gap-2 flex-wrap w-full px-2 sm:px-3 py-1 border border-blue-200 hover:border-blue-300 focus-within:border-blue-400`}
    >
      {fieldProps.field.value.map((val) => {
        return (
          <div
            key={val.slug}
            style={{ transition: '.3s background-color' }}
            className="flex mt-1 sm:text-sm mb-2 sm:my-0 justify-between rounded-md shadow-sm hover:bg-opacity-5 gap-2 items-center cursor-default shrink-0 py-1 pl-3 pr-2 bg-teal-400 bg-opacity-20"
          >
            <span>{val.name}</span>
            <span
              onClick={() => handleDelete(val.slug)}
              className="isax-close-circle -m-1 sm:m-0 px-1 sm:px-0 text-[18px] sm:!text-[15px] hover:text-red-600 cursor-pointer"
            ></span>
          </div>
        );
      })}
      <input
        name={fieldProps.field.name}
        id={fieldProps.field.name}
        onBlur={fieldProps.field.onBlur}
        placeholder={label}
        className={`${
          fieldProps.meta.error ? (fieldProps.meta.touched ? 'placeholder-red-500' : '') : ''
        } flex-1 sm:text-sm text-gray-700 placeholder-gray-400 w-full sm:w-auto p-1.5 flex outline-none`}
        type="text"
        onKeyDown={(e) => handleChange(e)}
      />
      {limit ? (
        <span className="pointer-events-none absolute bg-white bg-opacity-70 bottom-3 right-2 border border-transparent text-xs text-gray-400">
          {fieldProps.field.value.length || 0} / {limit}
        </span>
      ) : (
        ''
      )}
      <span
        style={{ transition: '.4s opacity' }}
        className={`${
          fieldProps.meta.error ? (fieldProps.meta.touched ? '' : 'opacity-0') : 'opacity-0'
        } absolute translate-y-2 bottom-0 right-0 text-xs text-red-500 bg-white px-2 mr-2 -mt-3`}
      >
        {fieldProps.meta.error}
      </span>
    </div>
  );
}
