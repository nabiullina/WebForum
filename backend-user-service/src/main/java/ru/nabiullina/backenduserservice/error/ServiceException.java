package ru.nabiullina.backenduserservice.error;

public class ServiceException extends RuntimeException {
    public ServiceException(String message) {
        super(message);
    }
}
