import { toast } from 'react-hot-toast';

export default function ImageUploader({ label, fieldProps, maxSize, square = false, children }) {
  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div>
      {label ? <div className="mb-2">{label}</div> : ''}
      <input
        type="file"
        name={fieldProps.field?.name}
        id="uploader"
        hidden
        accept="image/png, image/jpeg"
        onChange={async (e) => {
          const file = e.currentTarget.files[0];
          if (file) {
            if (file.size / 1024 / 1024 < maxSize) {
              const base64 = await convertBase64(file);
              let img = new Image();
              img.src = base64;
              img.onload = function () {
                if (square && this.width != this.height) {
                  toast.error('Image should be square');
                } else {
                  fieldProps.form.setFieldValue(fieldProps.field?.name, base64);
                }
              };
            } else {
              toast.error(`Image size should be less than ${maxSize}MB`);
            }
          }
        }}
      />
      {children}
    </div>
  );
}
