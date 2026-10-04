from enum import Enum


class UserStatusEnum(Enum):
    '''
    Contact - means user was added by manually importing his data
    to some organization contacts list.
    '''

    ACTIVE = "active"
    GUEST = "guest"


class UserGenderEnum(Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
