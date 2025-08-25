import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../services/api";
import { useAuth } from "../context/AuthContext";

const SignInPage = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const responseGoogle = async (authResult) => {
        try {
            if (authResult?.code) {
                const result = await googleAuth(authResult.code);
                const nextUser = result?.user || null;

                if (nextUser) {
                    localStorage.setItem(
                        "user-info",
                        JSON.stringify({
                            email: nextUser.email,
                            name: nextUser.name,
                            image: nextUser.picture || nextUser.image || "",
                        })
                    );
                    setUser(nextUser);
                    navigate("/home", { replace: true });
                }
            }
        } catch (error) {
            console.error("Google login failed:", error);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: responseGoogle,
        onError: (err) => console.error("Login Failed:", err),
        flow: "auth-code",
    });

    useEffect(() => {
        if (user) navigate("/home", { replace: true });
    }, [user, navigate]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
            <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <p className="text-3xl font-semibold py-2">FlowGen AI</p>

                <h1 className="text-4xl font-bold mb-4 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Sign in to continue
                </h1>

                <p className="mb-8 text-md">
                    Use your Google account to access the generator and gallery.
                </p>

                <button
                    onClick={googleLogin}
                    className="w-full flex items-center justify-center gap-4 border border-gray-600 p-4 rounded-xl hover:bg-gray-700 transition duration-300"
                >
                    <FcGoogle size={20} />
                    <span className="text-lg font-semibold">Sign in with Google</span>
                </button>

                <footer className="mt-12 text-gray-400 text-sm text-center">
                    &copy; {new Date().getFullYear()} FlowGen
                </footer>
            </div>
        </main>
    );
};

export default SignInPage;
