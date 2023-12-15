import jwt_decode from "jwt-decode";
import {BehaviorSubject, map, Observable} from "rxjs";

export const localStorageTokenKey = "IAMToken"

export const baseFetchRequest: () => Request = () => ({
    cache: "no-cache",
    credentials: "omit",
    headers: {
        // @ts-ignore
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem(localStorageTokenKey)}`
    },
    mode: "cors",
    redirect: "follow",
    referrerPolicy: "no-referrer",
})

export interface JWTClaims {
    sub: string
    exp: number
}

export class JWTService {
    private _jwtToken$ = new BehaviorSubject<string | undefined>(undefined)

    setToken(t: string | undefined) {
        if (t) {
          localStorage.setItem(localStorageTokenKey, t)
        } else {
          localStorage.removeItem(localStorageTokenKey)
        }
        this._jwtToken$.next(t)
    }

    getClaimsOnce(): JWTClaims | undefined {
        if (!localStorage.getItem(localStorageTokenKey)) {
            return undefined
        }
        const claims = jwt_decode<JWTClaims>(localStorage.getItem(localStorageTokenKey)!)
        if (new Date(claims.exp * 1000) < new Date()) {
            return undefined
        }
        return claims
    }

    getClaims(): Observable<JWTClaims | undefined> {
        return this._jwtToken$.pipe(
            map(() => {
                if (!localStorage.getItem(localStorageTokenKey)) {
                    return undefined
                }
                const claims = jwt_decode<JWTClaims>(localStorage.getItem(localStorageTokenKey)!)
                if (new Date(claims.exp * 1000) < new Date()) {
                    return undefined
                }
                return claims
            })
        )
    }
}
