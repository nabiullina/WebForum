package ru.nabiullina.backendpostservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nabiullina.backendpostservice.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
