import * as yup from 'yup'

export const registerSchema = yup.object({
    body:yup.object({
        firstName:yup.string().required('First name is required'),
        lastName:yup.string().required('Last name is required'),
        email:yup.string().email('Invalid email format'),
        phoneNumber:yup.string(),
        password:yup.string().required('Password is required')

    }).test('emailOrPhone','Either email or phone number is required',function(value){
        const {email,phoneNumber} = value || {};
        if (!email && !phoneNumber) {
            return this.createError({
                message: 'Either email or phone number is required'
            });
        }
        return true;
    })
});

