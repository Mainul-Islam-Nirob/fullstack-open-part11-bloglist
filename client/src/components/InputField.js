import React from 'react'
import PropTypes from 'prop-types'
import TextField from '@material-ui/core/TextField'

const InputField = ({ label, type, value, onChange, name }) => (
  <div>
    <TextField id="standard-basic" label={label}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
)

export default InputField

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string,
}