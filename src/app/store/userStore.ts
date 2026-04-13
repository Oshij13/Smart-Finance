let userData: any = JSON.parse(localStorage.getItem("userData") || "{}");

export const setUserData = (data: any) => {
    console.log("STORE SAVED:", data);
    userData = data;
    localStorage.setItem("userData", JSON.stringify(data)); // ✅ persist
};

export const getUserData = () => {
    const data = userData || {};
    console.log("STORE READ:", data);
    return data;
};