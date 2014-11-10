package controllers;

import play.*;
import play.mvc.*;
import play.data.*;
import views.html.*;
import static play.data.Form.*;
import models.Person;
import play.data.*;

import play.data.Form;

import java.util.List;

import play.db.ebean.Model;

import static play.libs.Json.*;

public class Application extends Controller {

    public static Result index() {
        return ok(index.render());
    }

    public static Result addPerson() {
    	Person person = Form.form(Person.class).bindFromRequest().get();

        person.save();
    	return redirect(routes.Application.index());
    }

    public static Result getPersons() {
    	List<Person> persons = new Model.Finder(String.class, Person.class).all();
    	return ok(toJson(persons));
    }
    public static Result login() {
        return ok(
                login.render(form(Login.class))
        );
    }

    public static class Login {

        public String email;
        public String password;


    }

    public static Result authenticate() {
        Form<Login> loginForm = form(Login.class).bindFromRequest();
        if (loginForm.hasErrors()) {
            return badRequest(login.render(loginForm));
        }
        else if(loginForm.get().email=="abc@def.com"){
            return redirect(
                    routes.Application.login()
            );
        }
        else {
            session().clear();
            session("email", loginForm.get().email);
            return redirect(
                    routes.Application.index()
            );
        }
    }

}

