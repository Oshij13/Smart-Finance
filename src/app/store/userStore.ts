let userData: any = JSON.parse(localStorage.getItem("userData") || "null");

export const setUserData = (data: any) => {
    console.log("STORE SAVED:", data);
    userData = data;
    localStorage.setItem("userData", JSON.stringify(data)); // ✅ persist
};

export const getUserData = () => {
    console.log("STORE READ:", userData);
    return userData;
};