import styles from "../styles";
const regex = /^[A-Za-z0-9]+$/g;
const CustomInput = ({ label, placeholder, value, handleValueChange }) => {
  return (
    <div>
      <label htmlFor="name" className={styles.label}>
        {label}
      </label>
      <input type={"text"} 
      placeholder={placeholder}
      defaultValue={value}
      onChange={e=>{
        if (e.target.value===""||regex.test(e.target.value)) {
                        handleValueChange(e.currentTarget.value)
        }
      }}
      className={styles.input}
      />
    </div>
  );
};

export default CustomInput;
