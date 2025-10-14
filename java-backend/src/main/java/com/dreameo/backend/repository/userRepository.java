package com.dreameo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dreameo.backend.model.user;

public interface userRepository extends JpaRepository<user, Long> {
}
// interfaz de acceso a BD