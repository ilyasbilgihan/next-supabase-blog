export default function Input({ type, label, limit, fieldProps, customError }) {
  return (
    <>
      <label
        style={{ transition: '.4s border-color' }}
        className={`${
          fieldProps.meta.error
            ? fieldProps.meta.touched
              ? '!border-red-500'
              : fieldProps.field.value
              ? '!border-red-500'
              : ''
            : fieldProps.field.value
            ? '!border-teal-600'
            : ''
        } font-inherit flex custom-input outline-none box-border bg-transparent relative rounded-lg py-2 w-full text-gray-700 border border-blue-200 hover:border-blue-300 focus:border-blue-400`}
      >
        {limit ? (
          <span className="pointer-events-none bg-white bg-opacity-70 absolute top-1 right-0 py-2 px-2  border border-transparent text-xs text-gray-400">
            {fieldProps.field.value.length} / {limit}
          </span>
        ) : (
          ''
        )}
        <input {...fieldProps.field} type={type} className=" outline-none w-full px-4" />
        <span
          style={{ transformOrigin: 'left center', transition: '.4s all' }}
          className={`${fieldProps.field.value ? 'px-2.5 !ml-2.5 !-top-2.5 scale-75' : ''} ${
            fieldProps.meta.error
              ? fieldProps.meta.touched
                ? '!text-red-500'
                : fieldProps.field.value
                ? '!text-red-500'
                : ''
              : fieldProps.field.value
              ? '!text-teal-600'
              : ''
          } absolute ml-[17px] text-sm left-0 top-2.5 bg-white pointer-events-none text-gray-400 `}
        >
          {label}
        </span>
        <span
          style={{ transition: '0.4s opacity' }}
          className={`${
            fieldProps.meta.error
              ? fieldProps.meta.touched
                ? ''
                : fieldProps.field.value
                ? ''
                : 'opacity-0'
              : 'opacity-0'
          } select-none absolute -bottom-1.5 right-1 text-xs text-red-500 bg-white px-2 mr-2 -mt-3`}
        >
          {customError || fieldProps.meta.error}
        </span>
      </label>
    </>
  );
}
