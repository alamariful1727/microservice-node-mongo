export const emailRegex = /^([a-z\d._-]+)@([a-z\d_-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/i;
export const contactNoRegex = /^(\+88)?01[1-9][0-9]{8}$/;
export const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])[\w!@#$%^&*,.;:'"_=+?`~<>()|/-]+$/;
export const IDRegex = /^[0-9a-fA-F]{24}$/;
export const time24HourRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
export const dateFormatRegex = /^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$/;
