package models;
import play.*;
import play.libs.*;
import com.avaje.ebean.Ebean;
import models.*;

import java.security.NoSuchAlgorithmException;
import java.util.*;
import org.apache.commons.codec.binary.Base64.*;
import java.security.MessageDigest;




public class PasswordHasher {

    public static String getHash(String password,String salt)  {
        String saltedPassword =password;
        for (int index=0;index<4;index++){
            saltedPassword=salt+saltedPassword;
            MessageDigest md = null;
            try {
                md = MessageDigest.getInstance("SHA-256");
                md.update(saltedPassword.getBytes());

                byte byteData[] = md.digest();

                //convert the byte to hex format method 1
                StringBuffer sb = new StringBuffer();
                for (int i = 0; i < byteData.length; i++) {
                    sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
                }

                System.out.println("Hex format : " +index+ "   "  + sb.toString());

                //convert the byte to hex format method 2
                StringBuffer hexString = new StringBuffer();
                for (int i=0;i<byteData.length;i++) {
                    String hex=Integer.toHexString(0xff & byteData[i]);
                    if(hex.length()==1) hexString.append('0');
                    hexString.append(hex);
                }

                saltedPassword=hexString.toString();


            } catch (NoSuchAlgorithmException e) {
                e.printStackTrace();
            }
                   }


        //Prepends the salt to the password


        //Hashed the salted password using SHA-512


        return saltedPassword;

    }

}