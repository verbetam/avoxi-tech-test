import { parsePhoneNumberFromString } from 'libphonenumber-js';
import buildAPIURI from './APIUtils';

async function fetchNumbers(params = {}) {
  try {
    // const page = params.page ? params.page : 1
    // const size = params.size ? params.size : 10

    let uri = buildAPIURI('/numbers', params);

    let res = await fetch(uri).then(res => res.json());

    if (res.error) {
      console.log("Error fetching numbers: ", res.message);
      return res;
    } else {
      let numbers = [];
      //const numbers = res.message;

      for (let i = 0; i < res.message.length; i++) {
        let number = res.message[i];
        if (number.first_name) number.user = number.first_name + " " + number.last_name;
        const phoneNumber = parsePhoneNumberFromString("+" + number.number.toString());
        if (phoneNumber) {
          number.number = phoneNumber.formatInternational();
          number.country = phoneNumber.country;
        }
        numbers[i] = number;
      }
      return {
        numbers: numbers,
        total: res.total
      }
    }
  }
  catch (e) {
    console.log(e);
    return e;
  }
}

export default fetchNumbers;