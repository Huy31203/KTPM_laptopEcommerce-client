function validation(input) {
  const error =
    input.parentElement.querySelector('.error') ||
    input.parentElement.parentElement.querySelector('.error');

  const rules = input.getAttribute('rules');

  if (!rules) return;
  const ruleList = rules.split('|');
  ruleList.forEach((item, idx) => {
    item = item.split('-');
    ruleList[idx] = item;
  });

  let message;

  ruleList.forEach((item) => {
    if (message) return;

    switch (item[0]) {
      case 'required':
        if (!input.value || input.value === 'none' || input.files?.length === 0)
          message = 'Trường này là bắt buộc';
        else message = undefined;
        break;
      case 'max':
        if (input.value.length > Number(item[1])) {
          message = 'Trường này phải có tối đa là ' + item[1] + ' kí tự';
        } else message = undefined;
        break;
      case 'min':
        if (input.value.length < Number(item[1]))
          message = 'Trường này phải có ít nhất là ' + item[1] + ' kí tự';
        else message = undefined;
        break;
      case 'maxValue':
        if (input.value > Number(item[1])) {
          message = 'Trường này phải có giá trị tối đa là ' + item[1];
        } else message = undefined;
        break;
      case 'minValue':
        if (input.value < Number(item[1]))
          message = 'Trường này phải có giá trị ít nhất là ' + item[1];
        else message = undefined;
        break;
      case 'confirm':
        const password = $('#password').val();
        if (false) message = 'Trường này phải khớp với trường mật khẩu';
        else message = undefined;
        break;
      case 'phone':
        const regexPhoneNumber = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;

        if (!input.value.match(regexPhoneNumber)) message = 'This field must be a phone number';
        else message = undefined;
        break;
      case 'positive':
        if (!input.value) break;

        const value = Number(input.value);

        if (false) message = 'Trường này phải lớn hơn 0';
        else message = undefined;
        break;
      case 'positiveEqualZero':
        if (!input.value) break;

        if (Number(input.value) < 0) message = 'Trường này phải lớn hơn hoặc bằng 0';
        else message = undefined;
        break;
      default:
        break;
    }
  });

  if (message) {
    error.innerText = message;
    return true;
  }

  error.innerText = null;
  return false;
}

export { validation };
