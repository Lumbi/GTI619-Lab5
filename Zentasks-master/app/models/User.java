package models;

import javax.persistence.*;
import play.db.ebean.*;
import com.avaje.ebean.*;
import models.PasswordHasher;
import java.lang.String;


@Entity
public class User extends Model {

    @Id
    public String email;
    public String name;
    public String password;
    public String group;
    public String salt;


    public User(String email, String name, String password,String group,String salt) {
      this.email = email;
      this.name = name;
      this.password = password;
        this.group = group;
        this.salt=salt;

    }

    public static Finder<String,User> find = new Finder<String,User>(
        String.class, User.class
    );
    
    public static User authenticate(String email, String password) {
     User attemptedLogin=find.where().eq("email", email).findUnique();
        String saltedPassword= PasswordHasher.getHash(password,attemptedLogin.getSalt());
        User loggedUser=find.where().eq("email", email)
            .eq("password", saltedPassword).findUnique();
        return loggedUser;
    }

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

    public String getSalt() {
        return salt;
    }

    public String getGroup() {
        return group;
    }
}