package com.dreameo.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.dreameo.backend.model.user;
import com.dreameo.backend.repository.userRepository;

import java.util.List;

@RestController
@RequestMapping("/users")
public class userController {

    @Autowired
    private userRepository userRepository;

    @PostMapping
    public user createUser(@RequestBody user user) {
        return userRepository.save(user);
    }

    @GetMapping
    public List<user> getAllUsers() {
        return userRepository.findAll();
    }
}
