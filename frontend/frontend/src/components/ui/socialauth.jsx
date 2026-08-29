import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "../../libs/api.jsx";
import { auth } from "../../libs/firebaseConfig";
import useStore from "../../store";
import { Button } from "../ui/button";
import Separator from "./Separator.jsx";

const SocialAuth = ({ isLoading, setIsLoading }) => {
  const [firebaseUser] = useAuthState(auth);
  const [providerClicked, setProviderClicked] = useState(null);
  const { setCredentials } = useStore();
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    setProviderClicked("google");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider); // Wait for popup
    } catch (err) {
      console.error(err);
      toast.error("Google login failed");
      setProviderClicked(null);
    }
  };

  useEffect(() => {
    if (!firebaseUser || !providerClicked) return;

    const handleSocialLogin = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.post("/auth/social-login", {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          provider: providerClicked,
          providerId: firebaseUser.uid,
        });

        if (data.user && data.token) {
          // Save user with token to localStorage
          const userToSave = { ...data.user, token: data.token };
          localStorage.setItem("user", JSON.stringify(userToSave));

          // Update Zustand store
          setCredentials(userToSave);

          // Navigate to dashboard
          navigate("/overview");
        } else {
          toast.error("Login failed: Invalid response from server.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Social login failed");
      } finally {
        setIsLoading(false);
        setProviderClicked(null);
      }
    };

    handleSocialLogin();
  }, [firebaseUser, providerClicked, navigate, setCredentials, setIsLoading]);

  return (
    <div>
      <div className="flex items-center justify-center gap-4 py-5">
        <Button onClick={signInWithGoogle} className="rounded-full" variant="outline">
          <FcGoogle size={22} />
        </Button>
      </div>
      <Separator label="OR" />
    </div>
  );
};

export default SocialAuth;
