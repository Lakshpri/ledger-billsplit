package com.notebook.splitter.repository;

import com.notebook.splitter.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupIdOrderByExpenseDateDescCreatedAtDesc(Long groupId);
}
