package com.g6.acrobatteAPI.models.user;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import com.g6.acrobatteAPI.models.validators.ValidPassword;

import lombok.Data;

@Data
public class UserSignupModel {

    @Email(message = "Email doit être valide")
    @NotBlank(message = "Le email ne peut pas être vide")
    public String email;

    @NotBlank(message = "Le prénom ne peut pas être vide")
    public String firstName;

    @NotBlank(message = "Le nom ne peut pas être vide")
    public String name;

    @NotBlank(message = "Le mot de passe ne peut pas être vide")
    @ValidPassword
    public String password;

    @NotBlank(message = "Le mot de passe de confirmation ne peut pas être vide")
    public String passwordConfirmation;
}