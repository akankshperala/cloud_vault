"use server"
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants/index";
import { redirect } from "next/navigation";

export const getUserByEmail = async (email) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])],
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error, message) => {
  console.log(error, message);
  throw error;
};


export const sendEmailOTP = async ({ email }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

export const createAccount = async ({
    fullName,
    email,
}) => {
    const existingUser = await getUserByEmail(email);

    const accountId = await sendEmailOTP({ email });
    if (!accountId) throw new Error("Failed to send an OTP");

    if (!existingUser) {
        const { databases } = await createAdminClient();

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.usersCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: avatarPlaceholderUrl,
                accountId,
            },
        );
    }

    return JSON.parse(JSON.stringify(accountId));
};
export const signInUser = async ({ email }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // User exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return JSON.parse(JSON.stringify({ accountId: existingUser.accountId }));
    }

    return JSON.parse(JSON.stringify({ accountId: null, error: "User not found" }));
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};
export const verifySecret = async ({
  accountId,
  password,
}) => {
  try {
    const { account } = await createAdminClient();
    //console.log(accountId.accountId,password)
    const session = await account.createSession(accountId, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return JSON.parse(JSON.stringify({ sessionId: session.$id }));
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)],
    );

    if (user.total <= 0) return null;

    return JSON.parse(JSON.stringify(user.documents[0]));
  } catch (error) {
    console.log(error);
  }
};
export const signOutUser = async () => {
  
  try {
      await account.deleteSession('current')
      (await cookies()).delete('appwrite-session');
      console.log('User logged out successfully');
  } catch (error) {
      console.error('Error logging out user:', error);
  }finally{
    redirect("/sign-in")
  }
};
